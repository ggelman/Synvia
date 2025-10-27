#!/usr/bin/env python3
"""
Middleware Flask para Tratamento de Erros
Integra sistema de erros com aplicao Flask
"""

from flask import Flask, jsonify, request, g
from functools import wraps
import traceback
from datetime import datetime
from typing import Any, Dict, Optional

from error_handling import (
    error_handler, BaseAIException, ErrorSeverity, ErrorCategory,
    NetworkError, DatabaseError, AIAPIError, ValidationError,
    format_error_for_user, NETWORK_RETRY_CONFIG, DATABASE_RETRY_CONFIG,
    AI_API_RETRY_CONFIG, retry_with_fallback
)

try:
    from monitoring_system import logger, metrics
except ImportError:
    import logging
    metrics = None

class FlaskErrorHandler:
    """Middleware para tratamento de erros em aplicaes Flask."""
    
    def __init__(self, app: Flask = None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Inicializa middleware na aplicao Flask."""
        app.config.setdefault('ERROR_HANDLER_ENABLED', True)
        app.config.setdefault('ERROR_HANDLER_INCLUDE_TRACEBACK', False)
        app.config.setdefault('ERROR_HANDLER_LOG_ERRORS', True)
        
        # Registra handlers de erro
        self._register_error_handlers(app)
        
        # Registra middleware de request
        app.before_request(self._before_request)
        app.after_request(self._after_request)
        app.teardown_appcontext(self._teardown_request)
        
        # Adiciona rotas de diagnstico
        self._add_diagnostic_routes(app)
    
    def _register_error_handlers(self, app: Flask):
        """Registra handlers para diferentes tipos de erro."""
        
        @app.errorhandler(BaseAIException)
        def handle_ai_exception(error: BaseAIException):
            """Handler para excees customizadas do sistema AI."""
            return self._create_error_response(error)
        
        @app.errorhandler(400)
        def handle_bad_request(error):
            """Handler para Bad Request."""
            ai_error = ValidationError(
                "Requisio invlida",
                context={'original_error': str(error), 'endpoint': request.endpoint}
            )
            return self._create_error_response(ai_error, status_code=400)
        
        @app.errorhandler(404)
        def handle_not_found(error):
            """Handler para Not Found."""
            ai_error = BaseAIException(
                "Recurso no encontrado",
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.LOW,
                context={'path': request.path, 'method': request.method}
            )
            return self._create_error_response(ai_error, status_code=404)
        
        @app.errorhandler(500)
        def handle_internal_error(error):
            """Handler para Internal Server Error."""
            ai_error = BaseAIException(
                "Erro interno do servidor",
                category=ErrorCategory.UNKNOWN,
                severity=ErrorSeverity.CRITICAL,
                context={
                    'endpoint': request.endpoint,
                    'method': request.method,
                    'original_error': str(error)
                }
            )
            return self._create_error_response(ai_error, status_code=500)
        
        @app.errorhandler(Exception)
        def handle_generic_exception(error):
            """Handler genrico para excees no tratadas."""
            ai_error = error_handler.handle_error(
                error,
                context={
                    'endpoint': request.endpoint,
                    'method': request.method,
                    'path': request.path,
                    'user_agent': request.headers.get('User-Agent', ''),
                    'remote_addr': request.remote_addr
                }
            )
            return self._create_error_response(ai_error, status_code=500)
    
    def _create_error_response(self, 
                              error: BaseAIException, 
                              status_code: int = None) -> tuple:
        """Cria resposta de erro padronizada."""
        
        # Determina status code se no fornecido
        if status_code is None:
            status_code = {
                ErrorSeverity.LOW: 400,
                ErrorSeverity.MEDIUM: 500,
                ErrorSeverity.HIGH: 500,
                ErrorSeverity.CRITICAL: 500
            }.get(error.severity, 500)
        
        # Monta resposta base
        response_data = {
            'success': False,
            'error': {
                'code': error.error_code,
                'message': format_error_for_user(error),
                'category': error.category.value,
                'severity': error.severity.value,
                'timestamp': error.timestamp.isoformat()
            },
            'request_id': getattr(g, 'request_id', None)
        }
        
        # Adiciona informaes tcnicas se configurado
        if self.app.config.get('ERROR_HANDLER_INCLUDE_TRACEBACK') and self.app.debug:
            response_data['error']['technical_message'] = error.message
            response_data['error']['context'] = error.context
            if error.traceback_info:
                response_data['error']['traceback'] = error.traceback_info
        
        # Log do erro
        if self.app.config.get('ERROR_HANDLER_LOG_ERRORS'):
            logger.error(
                f"Erro na API: {error.message}",
                error_code=error.error_code,
                category=error.category.value,
                severity=error.severity.value,
                endpoint=request.endpoint,
                method=request.method,
                status_code=status_code,
                request_id=getattr(g, 'request_id', None)
            )
        
        # Registra mtrica se disponvel
        if metrics:
            metrics.record_request(
                request.endpoint or request.path,
                getattr(g, 'request_duration', 0),
                status_code,
                error=True
            )
        
        return jsonify(response_data), status_code
    
    def _before_request(self):
        """Executado antes de cada request."""
        import uuid
        g.request_id = str(uuid.uuid4())
        g.request_start_time = datetime.now()
        
        # Log do incio da request
        logger.info(
            f"Request iniciada: {request.method} {request.path}",
            request_id=g.request_id,
            method=request.method,
            path=request.path,
            remote_addr=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')[:100]
        )
    
    def _after_request(self, response):
        """Executado aps cada request."""
        if hasattr(g, 'request_start_time'):
            duration = (datetime.now() - g.request_start_time).total_seconds()
            g.request_duration = duration
            
            # Log do fim da request
            logger.info(
                f"Request concluda: {request.method} {request.path}",
                request_id=g.request_id,
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2)
            )
            
            # Registra mtrica se disponvel
            if metrics:
                metrics.record_request(
                    request.endpoint or request.path,
                    duration,
                    response.status_code,
                    error=response.status_code >= 400
                )
        
        return response
    
    def _teardown_request(self, exception):
        """Executado no teardown da request."""
        if exception:
            logger.error(
                f"Exceo durante teardown: {exception}",
                request_id=getattr(g, 'request_id', None)
            )
    
    def _add_diagnostic_routes(self, app: Flask):
        """Adiciona rotas de diagnstico de erros."""
        
        @app.route('/api/errors/stats', methods=['GET'])
        def get_error_stats():
            """Retorna estatsticas de erro."""
            try:
                stats = error_handler.get_error_stats()
                return jsonify({
                    'success': True,
                    'data': stats
                }), 200
            except Exception as e:
                logger.error(f"Erro ao obter estatsticas: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro ao obter estatsticas de erro'
                }), 500
        
        @app.route('/api/errors/clear', methods=['POST'])
        def clear_error_stats():
            """Limpa estatsticas de erro."""
            try:
                from error_handling import clear_error_stats
                clear_error_stats()
                
                return jsonify({
                    'success': True,
                    'message': 'Estatsticas de erro limpas com sucesso'
                }), 200
            except Exception as e:
                logger.error(f"Erro ao limpar estatsticas: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro ao limpar estatsticas'
                }), 500
        
        @app.route('/api/errors/test', methods=['POST'])
        def test_error_handling():
            """Endpoint para testar tratamento de erros."""
            try:
                data = request.get_json() or {}
                error_type = data.get('type', 'generic')
                
                if error_type == 'network':
                    raise NetworkError("Erro de rede de teste")
                elif error_type == 'database':
                    raise DatabaseError("Erro de database de teste")
                elif error_type == 'ai_api':
                    raise AIAPIError("Erro de API IA de teste")
                elif error_type == 'validation':
                    raise ValidationError("Erro de validao de teste")
                else:
                    raise Exception("Erro genrico de teste")
                    
            except Exception as e:
                # Deixa o handler de erro processar
                raise

# Decoradores teis para tratamento de erro
def handle_api_errors(reraise: bool = False):
    """Decorator para tratamento de erros em endpoints da API."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except BaseAIException:
                # Deixa o middleware processar
                if reraise:
                    raise
                # Se no reraise, o Flask handler pegar
                raise
            except Exception as e:
                # Converte para nossa exceo
                ai_error = error_handler.handle_error(
                    e,
                    context={
                        'function': func.__name__,
                        'endpoint': request.endpoint,
                        'method': request.method
                    }
                )
                if reraise:
                    raise ai_error
                raise ai_error
        return wrapper
    return decorator

def with_database_retry(func):
    """Decorator para retry automtico em operaes de database."""
    @retry_with_fallback(
        retry_config=DATABASE_RETRY_CONFIG,
        exceptions=(DatabaseError, Exception)
    )
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def with_ai_api_retry(func):
    """Decorator para retry automtico em chamadas de API IA."""
    @retry_with_fallback(
        retry_config=AI_API_RETRY_CONFIG,
        exceptions=(AIAPIError, NetworkError, Exception)
    )
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def with_network_retry(func):
    """Decorator para retry automtico em operaes de rede."""
    @retry_with_fallback(
        retry_config=NETWORK_RETRY_CONFIG,
        exceptions=(NetworkError, Exception)
    )
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def validate_request_data(required_fields: list = None, 
                         optional_fields: list = None):
    """Decorator para validao de dados de request."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                data = request.get_json() or {}
                
                # Valida campos obrigatrios
                if required_fields:
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        raise ValidationError(
                            f"Campos obrigatrios ausentes: {', '.join(missing_fields)}",
                            context={'missing_fields': missing_fields, 'received_data': data}
                        )
                
                # Valida tipos de dados se especificado
                # TODO: Implementar validao de tipos mais robusta
                
                return func(*args, **kwargs)
                
            except ValidationError:
                raise
            except Exception as e:
                raise ValidationError(
                    f"Erro na validao dos dados: {str(e)}",
                    context={'received_data': data if 'data' in locals() else None}
                )
        return wrapper
    return decorator

# Funes utilitrias
def get_current_request_id() -> Optional[str]:
    """Retorna ID da request atual."""
    return getattr(g, 'request_id', None)

def add_error_context(context: Dict[str, Any]):
    """Adiciona contexto para erros da request atual."""
    if not hasattr(g, 'error_context'):
        g.error_context = {}
    g.error_context.update(context)

def get_error_context() -> Dict[str, Any]:
    """Retorna contexto de erro da request atual."""
    return getattr(g, 'error_context', {})

# Context manager para operaes crticas
class CriticalOperation:
    """Context manager para operaes crticas com tratamento de erro."""
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        
    def __enter__(self):
        self.start_time = datetime.now()
        logger.info(f"Iniciando operao crtica: {self.operation_name}")
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now() - self.start_time).total_seconds()
        
        if exc_type is not None:
            # Erro durante operao crtica
            error_handler.handle_error(
                exc_val,
                context={
                    'operation': self.operation_name,
                    'duration_seconds': duration,
                    'critical': True
                },
                severity=ErrorSeverity.CRITICAL
            )
            logger.critical(f"Falha em operao crtica: {self.operation_name}")
        else:
            logger.info(f"Operao crtica concluda: {self.operation_name} ({duration:.2f}s)")
        
        return False  # No suprime excees
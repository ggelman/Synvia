#!/usr/bin/env python3
"""
Sistema de Tratamento de Erros Avanado
Implementa exception handling padronizado, retry logic e fallbacks graceful
"""

import time
import functools
import logging
import traceback
import inspect
from typing import Any, Callable, Dict, List, Optional, Union, Type
from datetime import datetime, timedelta
from enum import Enum
import random
import json
import os

# Importar sistema de monitoramento se disponvel
try:
    from monitoring_system import logger
except ImportError:
    import logging

class ErrorSeverity(Enum):
    """Nveis de severidade de erro."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    """Categorias de erro para classificao."""
    NETWORK = "network"
    DATABASE = "database"
    AI_API = "ai_api"
    FILE_SYSTEM = "file_system"
    VALIDATION = "validation"
    BUSINESS_LOGIC = "business_logic"
    AUTHENTICATION = "authentication"
    CONFIGURATION = "configuration"
    UNKNOWN = "unknown"

class BaseAIException(Exception):
    """Classe base para todas as excees do sistema AI."""
    
    def __init__(self, 
                 message: str,
                 error_code: str = None,
                 category: ErrorCategory = ErrorCategory.UNKNOWN,
                 severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                 context: Dict[str, Any] = None,
                 original_exception: Exception = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.category = category
        self.severity = severity
        self.context = context or {}
        self.original_exception = original_exception
        self.timestamp = datetime.now()
        self.traceback_info = traceback.format_exc() if original_exception else None
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte exceo para dicionrio estruturado."""
        return {
            'error_code': self.error_code,
            'message': self.message,
            'category': self.category.value,
            'severity': self.severity.value,
            'timestamp': self.timestamp.isoformat(),
            'context': self.context,
            'traceback': self.traceback_info,
            'original_exception': str(self.original_exception) if self.original_exception else None
        }
    
    def to_json(self) -> str:
        """Converte exceo para JSON."""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)

class NetworkError(BaseAIException):
    """Exceo para erros de rede."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message, 
            category=ErrorCategory.NETWORK,
            severity=ErrorSeverity.MEDIUM,
            **kwargs
        )

class DatabaseError(BaseAIException):
    """Exceo para erros de banco de dados."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.DATABASE,
            severity=ErrorSeverity.HIGH,
            **kwargs
        )

class AIAPIError(BaseAIException):
    """Exceo para erros de APIs de IA."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.AI_API,
            severity=ErrorSeverity.MEDIUM,
            **kwargs
        )

class ValidationError(BaseAIException):
    """Exceo para erros de validao."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.VALIDATION,
            severity=ErrorSeverity.LOW,
            **kwargs
        )

class ModelLoadError(BaseAIException):
    """Exceo para erros ao carregar modelos."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.FILE_SYSTEM,
            severity=ErrorSeverity.HIGH,
            **kwargs
        )

class ConfigurationError(BaseAIException):
    """Exceo para erros de configurao."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.CONFIGURATION,
            severity=ErrorSeverity.CRITICAL,
            **kwargs
        )

class RetryConfig:
    """Configurao para retry logic."""
    
    def __init__(self,
                 max_attempts: int = 3,
                 base_delay: float = 1.0,
                 max_delay: float = 60.0,
                 exponential_base: float = 2.0,
                 jitter: bool = True,
                 backoff_strategy: str = "exponential"):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter
        self.backoff_strategy = backoff_strategy
    
    def get_delay(self, attempt: int) -> float:
        """Calcula delay para tentativa especfica."""
        if self.backoff_strategy == "exponential":
            delay = self.base_delay * (self.exponential_base ** (attempt - 1))
        elif self.backoff_strategy == "linear":
            delay = self.base_delay * attempt
        else:  # fixed
            delay = self.base_delay
        
        # Aplica limite mximo
        delay = min(delay, self.max_delay)
        
        # Adiciona jitter para evitar thundering herd
        if self.jitter:
            delay *= (0.5 + random.random() * 0.5)
        
        return delay

class ErrorHandler:
    """Sistema centralizado de tratamento de erros."""
    
    def __init__(self):
        self.error_stats = {
            'total_errors': 0,
            'errors_by_category': {},
            'errors_by_severity': {},
            'last_errors': []
        }
        self.max_recent_errors = 100
    
    def handle_error(self, 
                    error: Exception,
                    context: Dict[str, Any] = None,
                    severity: ErrorSeverity = None) -> BaseAIException:
        """Processa e registra erro."""
        
        # Converte para nossa exceo padronizada se necessrio
        if isinstance(error, BaseAIException):
            ai_error = error
        else:
            ai_error = self._convert_to_ai_exception(error, context, severity)
        
        # Registra estatsticas
        self._record_error_stats(ai_error)
        
        # Log estruturado
        self._log_error(ai_error)
        
        return ai_error
    
    def _convert_to_ai_exception(self, 
                                error: Exception,
                                context: Dict[str, Any] = None,
                                severity: ErrorSeverity = None) -> BaseAIException:
        """Converte exceo genrica para nossa exceo padronizada."""
        
        error_type = type(error).__name__
        error_message = str(error)
        
        # Mapeia tipos de erro conhecidos
        if 'connection' in error_message.lower() or 'network' in error_message.lower():
            return NetworkError(
                f"Erro de rede: {error_message}",
                original_exception=error,
                context=context,
                severity=severity or ErrorSeverity.MEDIUM
            )
        elif 'database' in error_message.lower() or 'mysql' in error_message.lower():
            return DatabaseError(
                f"Erro de banco de dados: {error_message}",
                original_exception=error,
                context=context,
                severity=severity or ErrorSeverity.HIGH
            )
        elif 'openai' in error_message.lower() or 'api' in error_message.lower():
            return AIAPIError(
                f"Erro de API IA: {error_message}",
                original_exception=error,
                context=context,
                severity=severity or ErrorSeverity.MEDIUM
            )
        else:
            return BaseAIException(
                f"Erro no categorizado ({error_type}): {error_message}",
                original_exception=error,
                context=context,
                severity=severity or ErrorSeverity.MEDIUM
            )
    
    def _record_error_stats(self, error: BaseAIException):
        """Registra estatsticas do erro."""
        self.error_stats['total_errors'] += 1
        
        # Por categoria
        category = error.category.value
        if category not in self.error_stats['errors_by_category']:
            self.error_stats['errors_by_category'][category] = 0
        self.error_stats['errors_by_category'][category] += 1
        
        # Por severidade
        severity = error.severity.value
        if severity not in self.error_stats['errors_by_severity']:
            self.error_stats['errors_by_severity'][severity] = 0
        self.error_stats['errors_by_severity'][severity] += 1
        
        # Erros recentes
        self.error_stats['last_errors'].append({
            'timestamp': error.timestamp.isoformat(),
            'error_code': error.error_code,
            'message': error.message,
            'category': category,
            'severity': severity
        })
        
        # Mantm apenas os mais recentes
        if len(self.error_stats['last_errors']) > self.max_recent_errors:
            self.error_stats['last_errors'].pop(0)
    
    def _log_error(self, error: BaseAIException):
        """Registra erro no sistema de logging."""
        log_level = {
            ErrorSeverity.LOW: logging.INFO,
            ErrorSeverity.MEDIUM: logging.WARNING,
            ErrorSeverity.HIGH: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL
        }.get(error.severity, logging.ERROR)
        
        try:
            # Tenta usar logger estruturado
            logger.log(log_level, error.message,
                      error_code=error.error_code,
                      category=error.category.value,
                      severity=error.severity.value,
                      context=error.context,
                      original_exception=str(error.original_exception) if error.original_exception else None)
        except Exception:
            # Fallback para logging padro
            logging.log(log_level, f"[{error.error_code}] {error.message}")
    
    def get_error_stats(self) -> Dict[str, Any]:
        """Retorna estatsticas de erro."""
        return {
            **self.error_stats,
            'timestamp': datetime.now().isoformat()
        }

def retry_with_fallback(
    retry_config: RetryConfig = None,
    fallback_function: Callable = None,
    exceptions: tuple = (Exception,),
    on_retry: Callable = None
):
    """
    Decorator para retry automtico com fallback.
    
    Args:
        retry_config: Configurao de retry
        fallback_function: Funo de fallback em caso de falha
        exceptions: Tupla de excees que devem trigger retry
        on_retry: Callback executado a cada retry
    """
    if retry_config is None:
        retry_config = RetryConfig()
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(1, retry_config.max_attempts + 1):
                try:
                    # Tenta executar funo
                    result = func(*args, **kwargs)
                    
                    # Log de sucesso aps retry
                    if attempt > 1:
                        logger.info(f"Funo {func.__name__} executada com sucesso na tentativa {attempt}")
                    
                    return result
                    
                except exceptions as e:
                    last_exception = e
                    
                    # Log da tentativa falhada
                    error_handler.handle_error(
                        e, 
                        context={
                            'function': func.__name__,
                            'attempt': attempt,
                            'max_attempts': retry_config.max_attempts,
                            'args': str(args)[:200],  # Limita tamanho
                            'kwargs': str(kwargs)[:200]
                        }
                    )
                    
                    # Se no  a ltima tentativa, aguarda e tenta novamente
                    if attempt < retry_config.max_attempts:
                        delay = retry_config.get_delay(attempt)
                        logger.warning(f"Tentativa {attempt} de {func.__name__} falhou. "
                                     f"Tentando novamente em {delay:.2f}s...")
                        
                        # Callback de retry se fornecido
                        if on_retry:
                            try:
                                on_retry(e, attempt, delay)
                            except Exception as callback_error:
                                logger.error(f"Erro no callback de retry: {callback_error}")
                        
                        time.sleep(delay)
                    else:
                        # ltima tentativa falhou
                        logger.error(f"Funo {func.__name__} falhou aps {retry_config.max_attempts} tentativas")
            
            # Se chegou aqui, todas as tentativas falharam
            if fallback_function:
                try:
                    logger.info(f"Executando fallback para {func.__name__}")
                    return fallback_function(*args, **kwargs)
                except Exception as fallback_error:
                    logger.error(f"Fallback tambm falhou para {func.__name__}: {fallback_error}")
                    # Levanta erro original, no o do fallback
                    raise last_exception
            else:
                raise last_exception
        
        return wrapper
    return decorator

def safe_execute(
    func: Callable,
    *args,
    default_return=None,
    error_context: Dict[str, Any] = None,
    log_errors: bool = True,
    **kwargs
) -> Any:
    """
    Executa funo de forma segura com tratamento de erro.
    
    Args:
        func: Funo a ser executada
        default_return: Valor retornado em caso de erro
        error_context: Contexto adicional para logs
        log_errors: Se deve logar erros
        *args, **kwargs: Argumentos da funo
    
    Returns:
        Resultado da funo ou default_return em caso de erro
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        if log_errors:
            context = {
                'function': func.__name__ if hasattr(func, '__name__') else str(func),
                'args': str(args)[:200],
                'kwargs': str(kwargs)[:200]
            }
            if error_context:
                context.update(error_context)
            
            error_handler.handle_error(e, context=context)
        
        return default_return

def error_boundary(
    fallback_value=None,
    reraise: bool = False,
    error_callback: Callable = None
):
    """
    Decorator que cria boundary de erro para funes.
    
    Args:
        fallback_value: Valor retornado em caso de erro
        reraise: Se deve relanar a exceo aps log
        error_callback: Callback executado em caso de erro
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Processa erro
                ai_error = error_handler.handle_error(
                    e,
                    context={
                        'function': func.__name__,
                        'module': func.__module__,
                        'args': str(args)[:200],
                        'kwargs': str(kwargs)[:200]
                    }
                )
                
                # Executa callback se fornecido
                if error_callback:
                    try:
                        error_callback(ai_error)
                    except Exception as callback_error:
                        logger.error(f"Erro no callback de erro: {callback_error}")
                
                # Decide se relana ou retorna fallback
                if reraise:
                    raise ai_error
                else:
                    return fallback_value
        
        return wrapper
    return decorator

# Instncia global do handler
error_handler = ErrorHandler()

# Configuraes de retry predefinidas
NETWORK_RETRY_CONFIG = RetryConfig(
    max_attempts=3,
    base_delay=1.0,
    max_delay=10.0,
    exponential_base=2.0
)

DATABASE_RETRY_CONFIG = RetryConfig(
    max_attempts=2,
    base_delay=0.5,
    max_delay=5.0,
    exponential_base=2.0
)

AI_API_RETRY_CONFIG = RetryConfig(
    max_attempts=3,
    base_delay=2.0,
    max_delay=30.0,
    exponential_base=2.0
)

# Funes utilitrias
def get_error_summary() -> Dict[str, Any]:
    """Retorna resumo dos erros do sistema."""
    return error_handler.get_error_stats()

def clear_error_stats():
    """Limpa estatsticas de erro."""
    error_handler.error_stats = {
        'total_errors': 0,
        'errors_by_category': {},
        'errors_by_severity': {},
        'last_errors': []
    }

def is_retryable_error(error: Exception) -> bool:
    """Verifica se erro  passvel de retry."""
    error_msg = str(error).lower()
    retryable_patterns = [
        'timeout', 'connection', 'network', 'temporary',
        'rate limit', 'service unavailable', 'internal server error'
    ]
    return any(pattern in error_msg for pattern in retryable_patterns)

def format_error_for_user(error: BaseAIException) -> str:
    """Formata erro para exibio ao usurio final."""
    user_messages = {
        ErrorCategory.NETWORK: "Problema de conexo. Tente novamente em alguns instantes.",
        ErrorCategory.DATABASE: "Problema no banco de dados. Nossa equipe foi notificada.",
        ErrorCategory.AI_API: "Servio de IA temporariamente indisponvel. Tente novamente.",
        ErrorCategory.VALIDATION: "Dados fornecidos so invlidos. Verifique e tente novamente.",
        ErrorCategory.FILE_SYSTEM: "Problema ao acessar arquivos do sistema.",
        ErrorCategory.CONFIGURATION: "Problema de configurao do sistema."
    }
    
    return user_messages.get(error.category, "Ocorreu um erro inesperado. Tente novamente.")

# Context manager para tratamento de erro
class ErrorContext:
    """Context manager para tratamento de erro em bloco."""
    
    def __init__(self, 
                 context_name: str,
                 fallback_value=None,
                 reraise: bool = True):
        self.context_name = context_name
        self.fallback_value = fallback_value
        self.reraise = reraise
        self.error = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.error = error_handler.handle_error(
                exc_val,
                context={'context': self.context_name}
            )
            
            if not self.reraise:
                return True  # Suprime exceo
        return False
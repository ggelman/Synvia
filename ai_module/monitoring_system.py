#!/usr/bin/env python3
"""
Sistema de Logging Estruturado e Monitoramento
Implementa logging JSON, mtricas de performance e health checks
"""

import json
import logging
import time
import psutil
import threading
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional, List
from collections import defaultdict, deque
import uuid
import os

# Inicializar logger global
logger = None

class StructuredLogger:
    """Logger estruturado que produz logs em formato JSON."""
    
    def __init__(self, name: str = "ai_service", level: int = logging.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Remove handlers existentes para evitar duplicao
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Handler para console com formatao JSON
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(console_handler)
        
        # Handler para arquivo de log
        file_handler = logging.FileHandler('ai_service.log', encoding='utf-8')
        file_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(file_handler)
        
        # Handler para arquivo de erro separado
        error_handler = logging.FileHandler('ai_service_error.log', encoding='utf-8')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(error_handler)
    
    def _log(self, level: int, message: str, **kwargs):
        """Log estruturado com contexto adicional."""
        extra_data = {
            'timestamp': datetime.now().isoformat(),
            'service': 'ai_module',
            'version': '1.0.0',
            **kwargs
        }
        
        # Adiciona informaes do sistema se disponvel
        try:
            extra_data.update({
                'memory_usage_mb': psutil.Process().memory_info().rss / 1024 / 1024,
                'cpu_percent': psutil.cpu_percent()
            })
        except:
            pass
        
        self.logger.log(level, message, extra=extra_data)
    
    def info(self, message: str, **kwargs):
        """Log de informao."""
        self._log(logging.INFO, message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de aviso."""
        self._log(logging.WARNING, message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de erro."""
        self._log(logging.ERROR, message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log de debug."""
        self._log(logging.DEBUG, message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log crtico."""
        self._log(logging.CRITICAL, message, **kwargs)

class JSONFormatter(logging.Formatter):
    """Formatador JSON para logs estruturados."""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Adiciona dados extra se existirem
        if hasattr(record, 'timestamp'):
            log_data['service_timestamp'] = record.timestamp
        if hasattr(record, 'service'):
            log_data['service'] = record.service
        if hasattr(record, 'version'):
            log_data['version'] = record.version
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'endpoint'):
            log_data['endpoint'] = record.endpoint
        if hasattr(record, 'method'):
            log_data['method'] = record.method
        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms
        if hasattr(record, 'status_code'):
            log_data['status_code'] = record.status_code
        if hasattr(record, 'memory_usage_mb'):
            log_data['memory_usage_mb'] = record.memory_usage_mb
        if hasattr(record, 'cpu_percent'):
            log_data['cpu_percent'] = record.cpu_percent
        if hasattr(record, 'product_name'):
            log_data['product_name'] = record.product_name
        if hasattr(record, 'prediction_days'):
            log_data['prediction_days'] = record.prediction_days
        if hasattr(record, 'model_accuracy'):
            log_data['model_accuracy'] = record.model_accuracy
        if hasattr(record, 'cache_hit'):
            log_data['cache_hit'] = record.cache_hit
        
        # Adiciona traceback se for um erro
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data, ensure_ascii=False)

class PerformanceMetrics:
    """Sistema de mtricas de performance."""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.metrics = defaultdict(lambda: {
            'count': 0,
            'total_time': 0,
            'min_time': float('inf'),
            'max_time': 0,
            'errors': 0,
            'history': deque(maxlen=max_history)
        })
        self.accuracy_metrics = defaultdict(lambda: {
            'predictions': 0,
            'total_accuracy': 0,
            'min_accuracy': float('inf'),
            'max_accuracy': 0,
            'history': deque(maxlen=max_history)
        })
        self._lock = threading.Lock()
    
    def record_request(self, endpoint: str, duration: float, status_code: int = 200, error: bool = False):
        """Registra mtricas de uma requisio."""
        with self._lock:
            metric = self.metrics[endpoint]
            metric['count'] += 1
            metric['total_time'] += duration
            metric['min_time'] = min(metric['min_time'], duration)
            metric['max_time'] = max(metric['max_time'], duration)
            
            if error:
                metric['errors'] += 1
            
            metric['history'].append({
                'timestamp': datetime.now().isoformat(),
                'duration': duration,
                'status_code': status_code,
                'error': error
            })
    
    def record_accuracy(self, model_name: str, accuracy: float):
        """Registra mtricas de acurcia do modelo."""
        with self._lock:
            metric = self.accuracy_metrics[model_name]
            metric['predictions'] += 1
            metric['total_accuracy'] += accuracy
            metric['min_accuracy'] = min(metric['min_accuracy'], accuracy)
            metric['max_accuracy'] = max(metric['max_accuracy'], accuracy)
            
            metric['history'].append({
                'timestamp': datetime.now().isoformat(),
                'accuracy': accuracy
            })
    
    def get_metrics(self) -> Dict[str, Any]:
        """Retorna mtricas compiladas."""
        with self._lock:
            compiled_metrics = {}
            
            for endpoint, metric in self.metrics.items():
                if metric['count'] > 0:
                    avg_time = metric['total_time'] / metric['count']
                    error_rate = metric['errors'] / metric['count'] * 100
                    
                    compiled_metrics[endpoint] = {
                        'requests': metric['count'],
                        'avg_response_time_ms': round(avg_time * 1000, 2),
                        'min_response_time_ms': round(metric['min_time'] * 1000, 2),
                        'max_response_time_ms': round(metric['max_time'] * 1000, 2),
                        'error_rate_percent': round(error_rate, 2),
                        'errors': metric['errors']
                    }
            
            accuracy_data = {}
            for model, metric in self.accuracy_metrics.items():
                if metric['predictions'] > 0:
                    avg_accuracy = metric['total_accuracy'] / metric['predictions']
                    accuracy_data[model] = {
                        'predictions': metric['predictions'],
                        'avg_accuracy': round(avg_accuracy, 4),
                        'min_accuracy': round(metric['min_accuracy'], 4),
                        'max_accuracy': round(metric['max_accuracy'], 4)
                    }
            
            return {
                'performance': compiled_metrics,
                'accuracy': accuracy_data,
                'system': self._get_system_metrics()
            }
    
    def _get_system_metrics(self) -> Dict[str, Any]:
        """Retorna mtricas do sistema."""
        try:
            return {
                'cpu_percent': psutil.cpu_percent(interval=0.1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:\\').percent,
                'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
            }
        except:
            return {'error': 'Unable to collect system metrics'}

# Inicializar logger global
logger = StructuredLogger("monitoring_system")

class HealthChecker:
    """Sistema de health checks robustos."""
    
    def __init__(self):
        self.checks = {}
        self.logger = StructuredLogger("health_checker")
    
    def register_check(self, name: str, check_func: callable, timeout: float = 5.0):
        """Registra um health check."""
        self.checks[name] = {
            'function': check_func,
            'timeout': timeout,
            'last_run': None,
            'last_status': None,
            'last_error': None
        }
    
    def run_check(self, name: str) -> Dict[str, Any]:
        """Executa um health check especfico."""
        if name not in self.checks:
            return {'status': 'error', 'message': f'Check {name} not found'}
        
        check = self.checks[name]
        start_time = time.time()
        
        try:
            # Timeout para o check
            result = self._run_with_timeout(check['function'], check['timeout'])
            duration = time.time() - start_time
            
            check['last_run'] = datetime.now().isoformat()
            check['last_status'] = 'healthy'
            check['last_error'] = None
            
            self.logger.info(f"Health check {name} passed", 
                           check_name=name, 
                           duration_ms=round(duration * 1000, 2))
            
            return {
                'status': 'healthy',
                'duration_ms': round(duration * 1000, 2),
                'details': result if isinstance(result, dict) else {'result': result}
            }
            
        except Exception as e:
            duration = time.time() - start_time
            check['last_run'] = datetime.now().isoformat()
            check['last_status'] = 'unhealthy'
            check['last_error'] = str(e)
            
            self.logger.error(f"Health check {name} failed", 
                            check_name=name, 
                            duration_ms=round(duration * 1000, 2),
                            error=str(e))
            
            return {
                'status': 'unhealthy',
                'duration_ms': round(duration * 1000, 2),
                'error': str(e)
            }
    
    def run_all_checks(self) -> Dict[str, Any]:
        """Executa todos os health checks."""
        results = {}
        overall_status = 'healthy'
        
        for name in self.checks:
            result = self.run_check(name)
            results[name] = result
            
            if result['status'] != 'healthy':
                overall_status = 'unhealthy'
        
        return {
            'overall_status': overall_status,
            'timestamp': datetime.now().isoformat(),
            'checks': results
        }
    
    def _run_with_timeout(self, func, timeout):
        """Executa funo com timeout."""
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError(f"Check timed out after {timeout} seconds")
        
        # Configura timeout apenas em sistemas Unix
        if hasattr(signal, 'SIGALRM'):
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(int(timeout))
        
        try:
            result = func()
            return result
        finally:
            if hasattr(signal, 'SIGALRM'):
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)

def performance_monitor(endpoint: str = None):
    """Decorator para monitoramento de performance."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            request_id = str(uuid.uuid4())
            endpoint_name = endpoint or f"{func.__module__}.{func.__name__}"
            
            start_time = time.time()
            error_occurred = False
            status_code = 200
            
            # Log incio da requisio
            logger.info(f"Starting {endpoint_name}", 
                       request_id=request_id,
                       endpoint=endpoint_name,
                       function=func.__name__)
            
            try:
                result = func(*args, **kwargs)
                return result
                
            except Exception as e:
                error_occurred = True
                status_code = 500
                logger.error(f"Error in {endpoint_name}", 
                           request_id=request_id,
                           endpoint=endpoint_name,
                           error=str(e))
                raise
                
            finally:
                duration = time.time() - start_time
                
                # Registra mtricas
                metrics.record_request(endpoint_name, duration, status_code, error_occurred)
                
                # Log fim da requisio
                logger.info(f"Completed {endpoint_name}", 
                           request_id=request_id,
                           endpoint=endpoint_name,
                           duration_ms=round(duration * 1000, 2),
                           status_code=status_code,
                           error=error_occurred)
        
        return wrapper
    return decorator

# Instncias globais
metrics = PerformanceMetrics()
health_checker = HealthChecker()

# Health checks padro
def check_database():
    """Health check para banco de dados."""
    try:
        import mysql.connector
        from mysql.connector import Error
        
        # Configurao de base de dados com segurana mnima
        import os
        db_password = os.getenv('DB_PASSWORD', 'default_secure_password_123')
        
        connection = mysql.connector.connect(
            host='localhost',
            database='synvia_platform',
            user='root',
            password=db_password,
            connection_timeout=3
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            # Executa query simples para testar conectividade
            cursor.fetchone()
            connection.close()
            return {'database': 'connected', 'query_test': 'passed'}
        else:
            return {'database': 'not_connected'}
            
    except Exception as e:
        return {'database': 'error', 'details': str(e)}

def check_models():
    """Health check para modelos treinados."""
    try:
        models_dir = 'trained_models'
        if not os.path.exists(models_dir):
            return {'models_directory': 'not_found'}
        
        model_files = [f for f in os.listdir(models_dir) if f.endswith('.pkl')]
        param_files = [f for f in os.listdir(models_dir) if f.endswith('.json')]
        
        return {
            'models_directory': 'exists',
            'model_files': len(model_files),
            'param_files': len(param_files),
            'models_available': len(model_files) > 0
        }
        
    except Exception as e:
        return {'models': 'error', 'details': str(e)}

def check_cache():
    """Health check para sistema de cache."""
    try:
        from redis_cache import health_check, get_cache_info
        
        cache_health = health_check()
        cache_info = get_cache_info()
        
        return {
            'cache_system': 'available',
            'redis_connected': cache_info.get('redis_connected', False),
            'cache_health': cache_health,
            'fallback_mode': not cache_info.get('redis_connected', False)
        }
        
    except Exception as e:
        return {'cache': 'error', 'details': str(e)}

def check_ai_apis():
    """Health check para APIs de IA (OpenAI/Gemini)."""
    try:
        import openai
        
        # Verifica se as chaves esto configuradas
        openai_key = os.environ.get("OPENAI_API_KEY")
        google_key = os.environ.get("GOOGLE_API_KEY")
        
        return {
            'openai_configured': bool(openai_key),
            'gemini_configured': bool(google_key),
            'apis_available': bool(openai_key) or bool(google_key)
        }
        
    except Exception as e:
        return {'ai_apis': 'error', 'details': str(e)}

# Registra health checks
health_checker.register_check('database', check_database, timeout=5.0)
health_checker.register_check('models', check_models, timeout=3.0)
health_checker.register_check('cache', check_cache, timeout=3.0)
health_checker.register_check('ai_apis', check_ai_apis, timeout=2.0)

# Funes auxiliares para integrao
def log_prediction(product_name: str, days: int, accuracy: float = None, cache_hit: bool = False):
    """Log especfico para predies."""
    logger.info("Prediction made", 
               product_name=product_name,
               prediction_days=days,
               model_accuracy=accuracy,
               cache_hit=cache_hit)
    
    if accuracy is not None:
        metrics.record_accuracy(product_name, accuracy)

def log_model_load(product_name: str, success: bool, cache_hit: bool = False):
    """Log especfico para carregamento de modelos."""
    if success:
        logger.info("Model loaded successfully", 
                   product_name=product_name,
                   cache_hit=cache_hit)
    else:
        logger.error("Model load failed", 
                    product_name=product_name)

def get_monitoring_data():
    """Retorna dados completos de monitoramento."""
    return {
        'metrics': metrics.get_metrics(),
        'health': health_checker.run_all_checks(),
        'timestamp': datetime.now().isoformat()
    }

def integrate_robust_health_checks():
    """Integra com o sistema de health checks robusto."""
    try:
        from health_checks import get_health_checker
        robust_checker = get_health_checker(logger=logger)
        
        # Executa health check completo
        health_result = robust_checker.perform_full_health_check()
        
        # Log do resultado
        logger.info(
            f"Health check robusto executado - Status: {health_result.overall_status.value}",
            extra={
                'robust_health_check': {
                    'overall_status': health_result.overall_status.value,
                    'total_components': health_result.total_components,
                    'healthy_components': health_result.healthy_components,
                    'warning_components': health_result.warning_components,
                    'critical_components': health_result.critical_components,
                    'alerts_count': len(health_result.alerts),
                    'component_details': [
                        {
                            'name': comp.name,
                            'status': comp.status.value,
                            'response_time': comp.response_time,
                            'uptime_percentage': comp.uptime_percentage,
                            'metrics_count': len(comp.metrics)
                        }
                        for comp in health_result.components
                    ],
                    'timestamp': health_result.timestamp.isoformat()
                }
            }
        )
        
        # Log alertas crticos separadamente
        for alert in health_result.alerts:
            if 'CRITICAL' in alert:
                logger.error(f"HEALTH ALERT: {alert}")
            else:
                logger.warning(f"HEALTH ALERT: {alert}")
        
        return health_result
        
    except Exception as e:
        logger.error(f"Erro ao integrar com health checker robusto: {e}")
        return None

def get_enhanced_monitoring_data():
    """Retorna dados de monitoramento incluindo health checks robustos."""
    base_data = get_monitoring_data()
    
    # Adiciona health checks robustos
    robust_health = integrate_robust_health_checks()
    if robust_health:
        base_data['robust_health'] = {
            'overall_status': robust_health.overall_status.value,
            'components': [
                {
                    'name': comp.name,
                    'type': comp.type.value,
                    'status': comp.status.value,
                    'response_time': comp.response_time,
                    'uptime_percentage': comp.uptime_percentage,
                    'metrics': [
                        {
                            'name': metric.name,
                            'value': metric.value,
                            'unit': metric.unit,
                            'status': metric.status.value
                        }
                        for metric in comp.metrics
                    ],
                    'error_message': comp.error_message
                }
                for comp in robust_health.components
            ],
            'system_metrics': [
                {
                    'name': metric.name,
                    'value': metric.value,
                    'unit': metric.unit,
                    'status': metric.status.value
                }
                for metric in robust_health.system_metrics
            ],
            'alerts': robust_health.alerts,
            'timestamp': robust_health.timestamp.isoformat()
        }
    
    return base_data
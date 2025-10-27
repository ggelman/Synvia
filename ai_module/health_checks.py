#!/usr/bin/env python3
"""
Sistema de Health Checks Robusto
================================

Sistema avanado de health checks com:
- Validao detalhada de componentes
- Mtricas de performance
- Alertas automticos
- Diagnsticos profundos
- SLA monitoring
"""

import time
import json
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import warnings
warnings.filterwarnings('ignore')

# Configuraes de health check
HEALTH_CHECK_TIMEOUT = 10  # segundos
CRITICAL_CPU_THRESHOLD = 90.0  # %
CRITICAL_MEMORY_THRESHOLD = 85.0  # %
CRITICAL_DISK_THRESHOLD = 90.0  # %
WARNING_RESPONSE_TIME = 1.0  # segundos
CRITICAL_RESPONSE_TIME = 3.0  # segundos

class HealthStatus(Enum):
    """Status de sade dos componentes."""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"
    UNAVAILABLE = "unavailable"

class ComponentType(Enum):
    """Tipos de componentes do sistema."""
    DATABASE = "database"
    CACHE = "cache"
    API_EXTERNAL = "api_external"
    ML_MODEL = "ml_model"
    SYSTEM = "system"
    SERVICE = "service"

@dataclass
class HealthMetric:
    """Mtrica de sade de um componente."""
    name: str
    value: float
    unit: str
    threshold_warning: Optional[float] = None
    threshold_critical: Optional[float] = None
    status: HealthStatus = HealthStatus.HEALTHY
    message: str = ""

@dataclass
class ComponentHealth:
    """Estado de sade de um componente."""
    name: str
    type: ComponentType
    status: HealthStatus
    response_time: float
    last_check: datetime
    metrics: List[HealthMetric]
    details: Dict[str, Any]
    error_message: Optional[str] = None
    uptime_percentage: float = 100.0
    dependencies: Optional[List[str]] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class SystemHealth:
    """Estado geral de sade do sistema."""
    overall_status: HealthStatus
    components: List[ComponentHealth]
    system_metrics: List[HealthMetric]
    timestamp: datetime
    total_components: int
    healthy_components: int
    warning_components: int
    critical_components: int
    alerts: List[str]

class HealthChecker:
    """Sistema robusto de health checks."""
    
    def __init__(self, logger=None):
        self.logger = logger
        self.component_history = {}
        self.alert_history = []
        self.last_check_time = None
        self._lock = threading.RLock()
        
        # Configuraes de alertas
        self.alert_cooldown = 300  # 5 minutos
        self.max_alert_history = 100
        
        # Contadores de uptime
        self.uptime_tracking = {}
        
    def check_database_health(self) -> ComponentHealth:
        """Verifica sade do banco de dados."""
        start_time = time.time()
        metrics = []
        details = {}
        
        try:
            # Simula verificao de database
            import mysql.connector
            from mysql.connector import Error
            
            # Teste de conexo
            connection_time = time.time()
            try:
                # Configuraes simuladas (em produo usar .env)
                config = {
                    'host': 'localhost',
                    'database': 'synvia_platform',
                    'user': 'root',
                    'password': 'password',
                    'connection_timeout': 5
                }
                
                connection = mysql.connector.connect(**config)
                if connection.is_connected():
                    connection_latency = (time.time() - connection_time) * 1000
                    
                    # Testa query simples
                    cursor = connection.cursor()
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                    cursor.close()
                    
                    # Mtricas de conexo
                    metrics.append(HealthMetric(
                        name="connection_latency",
                        value=connection_latency,
                        unit="ms",
                        threshold_warning=100.0,
                        threshold_critical=500.0,
                        status=self._get_metric_status(connection_latency, 100.0, 500.0)
                    ))
                    
                    # Informaes do servidor
                    cursor = connection.cursor()
                    cursor.execute("SELECT VERSION()")
                    version = cursor.fetchone()[0]
                    details['version'] = version
                    
                    # Verifica threads conectadas
                    cursor.execute("SHOW STATUS LIKE 'Threads_connected'")
                    threads = int(cursor.fetchone()[1])
                    details['active_connections'] = threads
                    
                    metrics.append(HealthMetric(
                        name="active_connections",
                        value=threads,
                        unit="connections",
                        threshold_warning=50,
                        threshold_critical=100,
                        status=self._get_metric_status(threads, 50, 100)
                    ))
                    
                    cursor.close()
                    connection.close()
                    
                    response_time = time.time() - start_time
                    status = HealthStatus.HEALTHY
                    error_msg = None
                    
                else:
                    raise Error("No foi possvel conectar ao database")
                    
            except Error as e:
                raise ConnectionError(f"MySQL Connection Error: {e}")
                
        except (ConnectionError, ImportError) as e:
            response_time = time.time() - start_time
            status = HealthStatus.CRITICAL
            error_msg = str(e)
            details['error'] = str(e)
            
            # Mtrica de erro
            metrics.append(HealthMetric(
                name="connection_status",
                value=0,
                unit="boolean",
                status=HealthStatus.CRITICAL,
                message=f"Connection failed: {e}"
            ))
        
        return ComponentHealth(
            name="MySQL Database",
            type=ComponentType.DATABASE,
            status=status,
            response_time=response_time,
            last_check=datetime.now(),
            metrics=metrics,
            details=details,
            error_message=error_msg,
            uptime_percentage=self._calculate_uptime("database", status == HealthStatus.HEALTHY)
        )
    
    def check_cache_health(self) -> ComponentHealth:
        """Verifica sade do cache Redis."""
        start_time = time.time()
        metrics = []
        details = {}
        
        try:
            from redis_cache import RedisCache
            cache = RedisCache()
            
            # Teste de conectividade
            test_key = f"health_check_{int(time.time())}"
            test_value = "health_test"
            
            # Teste de escrita
            write_start = time.time()
            cache.set(test_key, test_value, ttl=10)
            write_time = (time.time() - write_start) * 1000
            
            # Teste de leitura
            read_start = time.time()
            retrieved = cache.get(test_key)
            read_time = (time.time() - read_start) * 1000
            
            if retrieved == test_value:
                # Mtricas de performance
                metrics.append(HealthMetric(
                    name="write_latency",
                    value=write_time,
                    unit="ms",
                    threshold_warning=50.0,
                    threshold_critical=200.0,
                    status=self._get_metric_status(write_time, 50.0, 200.0)
                ))
                
                metrics.append(HealthMetric(
                    name="read_latency",
                    value=read_time,
                    unit="ms",
                    threshold_warning=25.0,
                    threshold_critical=100.0,
                    status=self._get_metric_status(read_time, 25.0, 100.0)
                ))
                
                # Estatsticas do cache
                stats = cache.get_stats()
                if stats:
                    hit_rate = (stats['hits'] / max(stats['requests'], 1)) * 100
                    metrics.append(HealthMetric(
                        name="hit_rate",
                        value=hit_rate,
                        unit="%",
                        threshold_warning=70.0,
                        threshold_critical=50.0,
                        status=self._get_metric_status(hit_rate, 70.0, 50.0, inverted=True)
                    ))
                    
                    details.update(stats)
                
                # Limpeza
                cache.delete(test_key)
                
                response_time = time.time() - start_time
                status = HealthStatus.HEALTHY
                error_msg = None
                
            else:
                raise ConnectionError("Cache read/write test failed")
                
        except (ConnectionError, ImportError, AttributeError) as e:
            response_time = time.time() - start_time
            status = HealthStatus.WARNING  # Cache tem fallback
            error_msg = str(e)
            details['error'] = str(e)
            details['fallback_active'] = True
            
            metrics.append(HealthMetric(
                name="cache_status",
                value=0,
                unit="boolean",
                status=HealthStatus.WARNING,
                message=f"Cache unavailable, using fallback: {e}"
            ))
        
        return ComponentHealth(
            name="Redis Cache",
            type=ComponentType.CACHE,
            status=status,
            response_time=response_time,
            last_check=datetime.now(),
            metrics=metrics,
            details=details,
            error_message=error_msg,
            uptime_percentage=self._calculate_uptime("cache", status == HealthStatus.HEALTHY)
        )
    
    def check_ml_models_health(self) -> ComponentHealth:
        """Verifica sade dos modelos ML."""
        start_time = time.time()
        metrics = []
        details = {}
        
        try:
            import os
            import pickle
            
            models_dir = "trained_models"
            if not os.path.exists(models_dir):
                raise FileNotFoundError("Diretrio de modelos no encontrado")
            
            # Lista modelos disponveis
            model_files = [f for f in os.listdir(models_dir) if f.endswith('.pkl')]
            total_models = len(model_files)
            
            if total_models == 0:
                raise FileNotFoundError("Nenhum modelo encontrado")
            
            # Teste de carregamento de um modelo
            test_model = model_files[0]
            load_start = time.time()
            
            try:
                with open(os.path.join(models_dir, test_model), 'rb') as f:
                    # Testa carregamento do modelo
                    pickle.load(f)
                load_time = (time.time() - load_start) * 1000
                
                metrics.append(HealthMetric(
                    name="model_load_time",
                    value=load_time,
                    unit="ms",
                    threshold_warning=1000.0,
                    threshold_critical=5000.0,
                    status=self._get_metric_status(load_time, 1000.0, 5000.0)
                ))
                
            except Exception as e:
                raise RuntimeError(f"Erro ao carregar modelo {test_model}: {e}")
            
            # Calcula tamanho mdio dos modelos
            total_size = sum(
                os.path.getsize(os.path.join(models_dir, f)) 
                for f in model_files
            )
            avg_size_mb = (total_size / total_models) / (1024 * 1024)
            
            metrics.append(HealthMetric(
                name="avg_model_size",
                value=avg_size_mb,
                unit="MB",
                threshold_warning=50.0,
                threshold_critical=100.0,
                status=self._get_metric_status(avg_size_mb, 50.0, 100.0)
            ))
            
            metrics.append(HealthMetric(
                name="total_models",
                value=total_models,
                unit="count",
                status=HealthStatus.HEALTHY if total_models > 0 else HealthStatus.CRITICAL
            ))
            
            details['models'] = model_files
            details['total_size_mb'] = total_size / (1024 * 1024)
            details['models_directory'] = models_dir
            
            response_time = time.time() - start_time
            status = HealthStatus.HEALTHY
            error_msg = None
            
        except Exception as e:
            response_time = time.time() - start_time
            status = HealthStatus.CRITICAL
            error_msg = str(e)
            details['error'] = str(e)
            
            metrics.append(HealthMetric(
                name="models_status",
                value=0,
                unit="boolean",
                status=HealthStatus.CRITICAL,
                message=f"Models unavailable: {e}"
            ))
        
        return ComponentHealth(
            name="ML Models",
            type=ComponentType.ML_MODEL,
            status=status,
            response_time=response_time,
            last_check=datetime.now(),
            metrics=metrics,
            details=details,
            error_message=error_msg,
            uptime_percentage=self._calculate_uptime("ml_models", status == HealthStatus.HEALTHY)
        )
    
    def check_external_apis_health(self) -> ComponentHealth:
        """Verifica sade das APIs externas."""
        start_time = time.time()
        metrics = []
        details = {}
        apis_status = []
        
        # Lista de APIs para testar
        apis_to_test = [
            {
                'name': 'Gemini API',
                'test_function': self._test_gemini_api,
                'critical': False
            },
            {
                'name': 'OpenAI API', 
                'test_function': self._test_openai_api,
                'critical': False
            }
        ]
        
        for api_config in apis_to_test:
            api_start = time.time()
            try:
                result = api_config['test_function']()
                api_time = (time.time() - api_start) * 1000
                
                apis_status.append({
                    'name': api_config['name'],
                    'status': 'healthy',
                    'response_time': api_time,
                    'details': result
                })
                
                metrics.append(HealthMetric(
                    name=f"{api_config['name'].lower().replace(' ', '_')}_latency",
                    value=api_time,
                    unit="ms",
                    threshold_warning=2000.0,
                    threshold_critical=5000.0,
                    status=self._get_metric_status(api_time, 2000.0, 5000.0)
                ))
                
            except Exception as e:
                api_time = (time.time() - api_start) * 1000
                apis_status.append({
                    'name': api_config['name'],
                    'status': 'unavailable',
                    'response_time': api_time,
                    'error': str(e)
                })
                
                metrics.append(HealthMetric(
                    name=f"{api_config['name'].lower().replace(' ', '_')}_status",
                    value=0,
                    unit="boolean",
                    status=HealthStatus.WARNING,  # APIs externas no so crticas
                    message=f"{api_config['name']} unavailable: {e}"
                ))
        
        # Determina status geral das APIs
        healthy_apis = len([api for api in apis_status if api['status'] == 'healthy'])
        total_apis = len(apis_status)
        
        if healthy_apis == total_apis:
            overall_status = HealthStatus.HEALTHY
        elif healthy_apis > 0:
            overall_status = HealthStatus.WARNING
        else:
            overall_status = HealthStatus.WARNING  # APIs so opcionais
        
        details['apis'] = apis_status
        details['healthy_count'] = healthy_apis
        details['total_count'] = total_apis
        
        response_time = time.time() - start_time
        
        return ComponentHealth(
            name="External APIs",
            type=ComponentType.API_EXTERNAL,
            status=overall_status,
            response_time=response_time,
            last_check=datetime.now(),
            metrics=metrics,
            details=details,
            error_message=None,
            uptime_percentage=self._calculate_uptime("external_apis", overall_status != HealthStatus.CRITICAL)
        )
    
    def check_system_health(self) -> ComponentHealth:
        """Verifica sade do sistema operacional."""
        start_time = time.time()
        metrics = []
        details = {}
        
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            metrics.append(HealthMetric(
                name="cpu_usage",
                value=cpu_percent,
                unit="%",
                threshold_warning=70.0,
                threshold_critical=CRITICAL_CPU_THRESHOLD,
                status=self._get_metric_status(cpu_percent, 70.0, CRITICAL_CPU_THRESHOLD)
            ))
            
            # Memria
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            metrics.append(HealthMetric(
                name="memory_usage",
                value=memory_percent,
                unit="%",
                threshold_warning=70.0,
                threshold_critical=CRITICAL_MEMORY_THRESHOLD,
                status=self._get_metric_status(memory_percent, 70.0, CRITICAL_MEMORY_THRESHOLD)
            ))
            
            # Disco
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            metrics.append(HealthMetric(
                name="disk_usage",
                value=disk_percent,
                unit="%",
                threshold_warning=80.0,
                threshold_critical=CRITICAL_DISK_THRESHOLD,
                status=self._get_metric_status(disk_percent, 80.0, CRITICAL_DISK_THRESHOLD)
            ))
            
            # Carga do sistema
            load_avg = psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0
            
            if load_avg > 0:
                metrics.append(HealthMetric(
                    name="load_average",
                    value=load_avg,
                    unit="load",
                    threshold_warning=cpu_count * 0.7,
                    threshold_critical=cpu_count * 0.9,
                    status=self._get_metric_status(load_avg, cpu_count * 0.7, cpu_count * 0.9)
                ))
            
            # Detalhes do sistema
            details.update({
                'cpu_count': cpu_count,
                'memory_total_gb': round(memory.total / (1024**3), 2),
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_total_gb': round(disk.total / (1024**3), 2),
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
            })
            
            # Status geral do sistema
            critical_metrics = [m for m in metrics if m.status == HealthStatus.CRITICAL]
            warning_metrics = [m for m in metrics if m.status == HealthStatus.WARNING]
            
            if critical_metrics:
                status = HealthStatus.CRITICAL
            elif warning_metrics:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.HEALTHY
            
            response_time = time.time() - start_time
            
        except Exception as e:
            response_time = time.time() - start_time
            status = HealthStatus.CRITICAL
            details['error'] = str(e)
            
            metrics.append(HealthMetric(
                name="system_status",
                value=0,
                unit="boolean",
                status=HealthStatus.CRITICAL,
                message=f"System check failed: {e}"
            ))
        
        return ComponentHealth(
            name="System Resources",
            type=ComponentType.SYSTEM,
            status=status,
            response_time=response_time,
            last_check=datetime.now(),
            metrics=metrics,
            details=details,
            uptime_percentage=self._calculate_uptime("system", status != HealthStatus.CRITICAL)
        )
    
    def _test_gemini_api(self) -> Dict[str, Any]:
        """Testa conectividade com Gemini API."""
        try:
            import google.generativeai as genai
            import os
            
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY no configurada")
            
            genai.configure(api_key=api_key)
            
            # Teste simples de gerao
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Test connectivity")
            
            return {
                'api_key_configured': True,
                'response_received': bool(response.text),
                'model': 'gemini-pro'
            }
            
        except Exception as e:
            raise ConnectionError(f"Gemini API test failed: {e}")
    
    def _test_openai_api(self) -> Dict[str, Any]:
        """Testa conectividade com OpenAI API."""
        try:
            import openai
            import os
            
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OPENAI_API_KEY no configurada")
            
            client = openai.OpenAI(api_key=api_key)
            
            # Teste simples
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5
            )
            
            return {
                'api_key_configured': True,
                'response_received': bool(response.choices),
                'model': 'gpt-3.5-turbo'
            }
            
        except Exception as e:
            raise ConnectionError(f"OpenAI API test failed: {e}")
    
    def _get_metric_status(self, value: float, warning_threshold: float, 
                          critical_threshold: float, inverted: bool = False) -> HealthStatus:
        """Determina status de uma mtrica baseado nos thresholds."""
        if inverted:
            # Para mtricas onde valores menores so piores (ex: hit rate)
            if value <= critical_threshold:
                return HealthStatus.CRITICAL
            elif value <= warning_threshold:
                return HealthStatus.WARNING
            else:
                return HealthStatus.HEALTHY
        else:
            # Para mtricas onde valores maiores so piores (ex: latncia)
            if value >= critical_threshold:
                return HealthStatus.CRITICAL
            elif value >= warning_threshold:
                return HealthStatus.WARNING
            else:
                return HealthStatus.HEALTHY
    
    def _calculate_uptime(self, component: str, is_healthy: bool) -> float:
        """Calcula porcentagem de uptime de um componente."""
        with self._lock:
            now = datetime.now()
            
            if component not in self.uptime_tracking:
                self.uptime_tracking[component] = {
                    'start_time': now,
                    'total_checks': 0,
                    'healthy_checks': 0
                }
            
            tracking = self.uptime_tracking[component]
            tracking['total_checks'] += 1
            
            if is_healthy:
                tracking['healthy_checks'] += 1
            
            if tracking['total_checks'] > 0:
                return (tracking['healthy_checks'] / tracking['total_checks']) * 100
            else:
                return 100.0
    
    def perform_full_health_check(self) -> SystemHealth:
        """Executa health check completo do sistema."""
        start_time = time.time()
        components = []
        alerts = []
        
        # Lista de verificaes a executar
        health_checks = [
            ("Database", self.check_database_health),
            ("Cache", self.check_cache_health),
            ("ML Models", self.check_ml_models_health),
            ("External APIs", self.check_external_apis_health),
            ("System", self.check_system_health)
        ]
        
        # Executa cada verificao
        for name, check_func in health_checks:
            try:
                component_health = check_func()
                components.append(component_health)
                
                # Gera alertas se necessrio
                if component_health.status == HealthStatus.CRITICAL:
                    alerts.append(f"CRITICAL: {component_health.name} - {component_health.error_message or 'Component is down'}")
                elif component_health.status == HealthStatus.WARNING:
                    alerts.append(f"WARNING: {component_health.name} - Performance degraded")
                
                # Log para histrico
                self._record_component_check(component_health)
                
            except Exception as e:
                if self.logger:
                    self.logger.error(f"Health check failed for {name}: {e}")
                
                # Cria componente com erro
                error_component = ComponentHealth(
                    name=name,
                    type=ComponentType.SERVICE,
                    status=HealthStatus.UNKNOWN,
                    response_time=0,
                    last_check=datetime.now(),
                    metrics=[],
                    details={'error': str(e)},
                    error_message=str(e),
                    uptime_percentage=0.0
                )
                components.append(error_component)
                alerts.append(f"CRITICAL: {name} health check failed - {e}")
        
        # Mtricas gerais do sistema
        system_metrics = self._get_system_overview_metrics()
        
        # Calcula status geral
        status_counts = {
            HealthStatus.HEALTHY: len([c for c in components if c.status == HealthStatus.HEALTHY]),
            HealthStatus.WARNING: len([c for c in components if c.status == HealthStatus.WARNING]),
            HealthStatus.CRITICAL: len([c for c in components if c.status == HealthStatus.CRITICAL]),
            HealthStatus.UNKNOWN: len([c for c in components if c.status == HealthStatus.UNKNOWN])
        }
        
        # Determina status geral
        if status_counts[HealthStatus.CRITICAL] > 0:
            overall_status = HealthStatus.CRITICAL
        elif status_counts[HealthStatus.WARNING] > 0:
            overall_status = HealthStatus.WARNING
        elif status_counts[HealthStatus.UNKNOWN] > 0:
            overall_status = HealthStatus.WARNING
        else:
            overall_status = HealthStatus.HEALTHY
        
        # Processa alertas
        self._process_alerts(alerts)
        
        system_health = SystemHealth(
            overall_status=overall_status,
            components=components,
            system_metrics=system_metrics,
            timestamp=datetime.now(),
            total_components=len(components),
            healthy_components=status_counts[HealthStatus.HEALTHY],
            warning_components=status_counts[HealthStatus.WARNING],
            critical_components=status_counts[HealthStatus.CRITICAL],
            alerts=alerts
        )
        
        self.last_check_time = datetime.now()
        
        if self.logger:
            self.logger.info(f"Health check completed in {time.time() - start_time:.2f}s - Status: {overall_status.value}")
        
        return system_health
    
    def _get_system_overview_metrics(self) -> List[HealthMetric]:
        """Obtm mtricas gerais do sistema."""
        metrics = []
        
        try:
            # Uptime do sistema
            boot_time = psutil.boot_time()
            uptime_seconds = time.time() - boot_time
            uptime_hours = uptime_seconds / 3600
            
            metrics.append(HealthMetric(
                name="system_uptime",
                value=uptime_hours,
                unit="hours",
                status=HealthStatus.HEALTHY
            ))
            
            # Processos ativos
            process_count = len(psutil.pids())
            metrics.append(HealthMetric(
                name="active_processes",
                value=process_count,
                unit="count",
                threshold_warning=300,
                threshold_critical=500,
                status=self._get_metric_status(process_count, 300, 500)
            ))
            
            # Network connections (se disponvel)
            try:
                connections = len(psutil.net_connections())
                metrics.append(HealthMetric(
                    name="network_connections",
                    value=connections,
                    unit="count",
                    threshold_warning=100,
                    threshold_critical=200,
                    status=self._get_metric_status(connections, 100, 200)
                ))
            except (AttributeError, OSError):
                pass  # Nem todas as plataformas suportam
            
        except Exception as e:
            if self.logger:
                self.logger.warning(f"Failed to get system overview metrics: {e}")
        
        return metrics
    
    def _record_component_check(self, component: ComponentHealth):
        """Registra resultado de health check no histrico."""
        with self._lock:
            if component.name not in self.component_history:
                self.component_history[component.name] = []
            
            # Mantm apenas os ltimos 100 checks
            history = self.component_history[component.name]
            history.append({
                'timestamp': component.last_check,
                'status': component.status.value,
                'response_time': component.response_time,
                'uptime_percentage': component.uptime_percentage
            })
            
            if len(history) > 100:
                history.pop(0)
    
    def _process_alerts(self, alerts: List[str]):
        """Processa e registra alertas."""
        if not alerts:
            return
        
        with self._lock:
            current_time = datetime.now()
            
            for alert in alerts:
                # Verifica cooldown de alertas
                recent_alerts = [
                    a for a in self.alert_history 
                    if a['message'] == alert and 
                    (current_time - a['timestamp']).total_seconds() < self.alert_cooldown
                ]
                
                if not recent_alerts:
                    # Novo alerta ou passou do cooldown
                    alert_record = {
                        'timestamp': current_time,
                        'message': alert,
                        'level': 'CRITICAL' if 'CRITICAL' in alert else 'WARNING'
                    }
                    
                    self.alert_history.append(alert_record)
                    
                    if self.logger:
                        if alert_record['level'] == 'CRITICAL':
                            self.logger.error(f"HEALTH ALERT: {alert}")
                        else:
                            self.logger.warning(f"HEALTH ALERT: {alert}")
            
            # Limpa histrico antigo
            if len(self.alert_history) > self.max_alert_history:
                self.alert_history = self.alert_history[-self.max_alert_history:]
    
    def get_component_history(self, component_name: str, limit: int = 50) -> List[Dict]:
        """Retorna histrico de um componente."""
        with self._lock:
            history = self.component_history.get(component_name, [])
            return history[-limit:] if limit else history
    
    def get_alert_history(self, limit: int = 50) -> List[Dict]:
        """Retorna histrico de alertas."""
        with self._lock:
            return self.alert_history[-limit:] if limit else self.alert_history
    
    def get_health_summary(self) -> Dict[str, Any]:
        """Retorna resumo rpido de sade."""
        if not self.last_check_time:
            return {'status': 'not_checked', 'message': 'Health check not performed yet'}
        
        time_since_check = (datetime.now() - self.last_check_time).total_seconds()
        
        if time_since_check > 300:  # 5 minutos
            return {
                'status': 'stale',
                'message': f'Last check was {int(time_since_check/60)} minutes ago',
                'last_check': self.last_check_time.isoformat()
            }
        
        # Executa check rpido se necessrio
        health = self.perform_full_health_check()
        
        return {
            'status': health.overall_status.value,
            'healthy_components': health.healthy_components,
            'total_components': health.total_components,
            'active_alerts': len(health.alerts),
            'last_check': health.timestamp.isoformat()
        }

# Instncia global
health_checker = HealthChecker()

def get_health_checker(logger=None):
    """Retorna instncia do health checker."""
    if logger and not health_checker.logger:
        health_checker.logger = logger
    return health_checker

# Funo utilitria para health check rpido
def quick_health_check() -> Dict[str, Any]:
    """Executa health check rpido."""
    checker = get_health_checker()
    return checker.get_health_summary()

if __name__ == "__main__":
    # Teste do sistema de health checks
    print(" Testando Sistema de Health Checks Robusto")
    print("=" * 60)
    
    checker = HealthChecker()
    health = checker.perform_full_health_check()
    
    print(f"\n Status Geral: {health.overall_status.value.upper()}")
    print(f" Timestamp: {health.timestamp}")
    print(f" Componentes: {health.healthy_components}/{health.total_components} saudveis")
    
    print("\n Componentes:")
    for component in health.components:
        # Determina cone de status baseado no status do componente
        if component.status == HealthStatus.HEALTHY:
            status_icon = ""
        elif component.status == HealthStatus.WARNING:
            status_icon = ""
        else:
            status_icon = ""
        
        print(f"  {status_icon} {component.name}: {component.status.value} ({component.response_time:.3f}s)")
        
        if component.error_message:
            print(f"     Erro: {component.error_message}")
    
    if health.alerts:
        print("\n Alertas Ativos:")
        for alert in health.alerts:
            print(f"   {alert}")
    else:
        print("\n Nenhum alerta ativo")
    
    print("\n Sistema de Health Checks implementado com sucesso!")
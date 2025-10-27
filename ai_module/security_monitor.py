"""
Sistema de Monitoramento de Segurana e DDoS Protection
Detecta padres suspeitos de trfego e potenciais ataques
"""
import time
import logging
from collections import defaultdict, deque
from datetime import datetime, timedelta
from threading import Lock
import json

class SecurityMonitor:
    def __init__(self):
        self.request_log = defaultdict(lambda: deque(maxlen=1000))
        self.blocked_ips = set()
        self.lock = Lock()
        
        # Configuraes de deteco
        self.rate_thresholds = {
            'requests_per_minute': 100,
            'requests_per_hour': 1000,
            'failed_requests_per_minute': 20,
            'unique_endpoints_per_minute': 50
        }
        
        # Logs de segurana
        self.security_logger = logging.getLogger('security')
        handler = logging.FileHandler('security_alerts.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.security_logger.addHandler(handler)
        self.security_logger.setLevel(logging.WARNING)
    
    def log_request(self, ip, endpoint, status_code, user_agent=''):
        """Registra uma requisio para anlise"""
        with self.lock:
            timestamp = datetime.now()
            request_data = {
                'timestamp': timestamp,
                'endpoint': endpoint,
                'status_code': status_code,
                'user_agent': user_agent
            }
            
            self.request_log[ip].append(request_data)
            
            # Analisa padres suspeitos
            self._analyze_patterns(ip)
    
    def _analyze_patterns(self, ip):
        """Analisa padres de requisies para detectar ameaas"""
        if ip in self.blocked_ips:
            return
            
        requests = list(self.request_log[ip])
        now = datetime.now()
        
        # Anlise de volume por minuto
        recent_requests = [r for r in requests 
                          if now - r['timestamp'] <= timedelta(minutes=1)]
        
        if len(recent_requests) > self.rate_thresholds['requests_per_minute']:
            self._create_alert(ip, 'HIGH_VOLUME', 
                             f"{len(recent_requests)} requests in 1 minute")
        
        # Anlise de falhas
        failed_requests = [r for r in recent_requests 
                          if r['status_code'] >= 400]
        
        if len(failed_requests) > self.rate_thresholds['failed_requests_per_minute']:
            self._create_alert(ip, 'HIGH_FAILURE_RATE', 
                             f"{len(failed_requests)} failed requests in 1 minute")
        
        # Anlise de endpoints nicos (possvel scanning)
        unique_endpoints = {r['endpoint'] for r in recent_requests}
        if len(unique_endpoints) > self.rate_thresholds['unique_endpoints_per_minute']:
            self._create_alert(ip, 'ENDPOINT_SCANNING', 
                             f"Accessed {len(unique_endpoints)} unique endpoints")
    
    def _create_alert(self, ip, alert_type, details):
        """Cria um alerta de segurana"""
        alert = {
            'timestamp': datetime.now().isoformat(),
            'ip': ip,
            'type': alert_type,
            'details': details,
            'action': 'MONITOR'
        }
        
        # Log do alerta
        self.security_logger.warning(f"SECURITY_ALERT: {json.dumps(alert)}")
        
        # Para ataques muito agressivos, pode bloquear temporariamente
        if alert_type in ['HIGH_VOLUME', 'HIGH_FAILURE_RATE']:
            recent_alerts = self._count_recent_alerts(ip)
            if recent_alerts >= 3:  # 3 alertas em pouco tempo
                self._temporary_block(ip)
    
    def _count_recent_alerts(self, ip):
        """Conta alertas recentes para um IP"""
        # Implementao simplificada - em produo usaria banco de dados
        # Conta alertas do IP na ltima hora
        one_hour_ago = datetime.now() - timedelta(hours=1)
        recent_alerts = [alert for alert in self.alerts 
                        if alert.get('ip') == ip and 
                        datetime.fromisoformat(alert.get('timestamp', '')) > one_hour_ago]
        return len(recent_alerts)
    
    def _temporary_block(self, ip):
        """Bloqueia temporariamente um IP suspeito"""
        self.blocked_ips.add(ip)
        
        alert = {
            'timestamp': datetime.now().isoformat(),
            'ip': ip,
            'type': 'IP_BLOCKED',
            'details': 'Temporary block due to suspicious activity',
            'action': 'BLOCK',
            'duration': '1 hour'
        }
        
        self.security_logger.error(f"IP_BLOCKED: {json.dumps(alert)}")
        
        # Remove o bloqueio aps 1 hora (em produo, usar scheduler)
        # threading.Timer(3600, lambda: self.blocked_ips.discard(ip)).start()
    
    def is_blocked(self, ip):
        """Verifica se um IP est bloqueado"""
        return ip in self.blocked_ips
    
    def get_security_stats(self):
        """Retorna estatsticas de segurana"""
        with self.lock:
            stats = {
                'total_ips_monitored': len(self.request_log),
                'blocked_ips': len(self.blocked_ips),
                'total_requests_logged': sum(len(requests) 
                                           for requests in self.request_log.values()),
                'top_ips_by_volume': self._get_top_ips(),
                'blocked_ips_list': list(self.blocked_ips)
            }
            return stats
    
    def _get_top_ips(self):
        """Retorna os IPs com maior volume de requisies"""
        ip_counts = [(ip, len(requests)) 
                    for ip, requests in self.request_log.items()]
        ip_counts.sort(key=lambda x: x[1], reverse=True)
        return ip_counts[:10]

# Instncia global do monitor
security_monitor = SecurityMonitor()
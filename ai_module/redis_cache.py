#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mdulo de cache Redis para o sistema de IA.
Implementa cache inteligente para modelos Prophet e predies.
"""

import redis
import pickle
import json
import hashlib
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, List
from functools import wraps
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

class RedisCache:
    """
    Sistema de cache Redis com fallback graceful.
    """
    
    def __init__(self):
        load_dotenv()
        self.redis_client = None
        self.enabled = False
        self._connect()
    
    def _connect(self):
        """Conecta ao Redis com fallback graceful."""
        try:
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_db = int(os.getenv('REDIS_DB', 0))
            redis_password = os.getenv('REDIS_PASSWORD', None)
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                decode_responses=False,  # Para trabalhar com dados binrios
                socket_connect_timeout=2,  # Timeout reduzido
                socket_timeout=2,         # Timeout reduzido
                retry_on_timeout=False    # No tentar novamente se falhar
            )
            
            # Testa a conexo
            self.redis_client.ping()
            self.enabled = True
            logger.info(f" Conectado ao Redis: {redis_host}:{redis_port}/{redis_db}")
            
        except Exception as e:
            logger.warning(f" Redis no disponvel: {e}. Funcionando sem cache.")
            self.enabled = False
            self.redis_client = None
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Gera chave nica para o cache."""
        # Combina argumentos e cria hash
        content = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
        return f"ai_module:{hashlib.md5(content.encode()).hexdigest()}"
    
    def get(self, key: str) -> Optional[Any]:
        """Recupera item do cache."""
        if not self.enabled:
            return None
        
        try:
            data = self.redis_client.get(key)
            if data:
                return pickle.loads(data)
            return None
        except Exception as e:
            logger.error(f"Erro ao ler do cache: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Armazena item no cache com TTL."""
        if not self.enabled:
            return False
        
        try:
            serialized_data = pickle.dumps(value)
            result = self.redis_client.setex(key, ttl, serialized_data)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return result
        except Exception as e:
            logger.error(f"Erro ao escrever no cache: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Remove item do cache."""
        if not self.enabled:
            return False
        
        try:
            result = self.redis_client.delete(key) > 0
            logger.debug(f"Cache delete: {key}")
            return result
        except Exception as e:
            logger.error(f"Erro ao deletar do cache: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Remove todos os itens que correspondem ao padro."""
        if not self.enabled:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Cache cleared: {deleted} keys matching '{pattern}'")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Erro ao limpar cache: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatsticas do cache."""
        if not self.enabled:
            return {"enabled": False, "error": "Redis no disponvel"}
        
        try:
            info = self.redis_client.info()
            return {
                "enabled": True,
                "connected_clients": info.get('connected_clients', 0),
                "used_memory_human": info.get('used_memory_human', '0B'),
                "keyspace_hits": info.get('keyspace_hits', 0),
                "keyspace_misses": info.get('keyspace_misses', 0),
                "hit_rate": self._calculate_hit_rate(info),
                "ai_module_keys": len(self.redis_client.keys("ai_module:*"))
            }
        except Exception as e:
            logger.error(f"Erro ao obter estatsticas: {e}")
            return {"enabled": False, "error": str(e)}
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """Calcula taxa de hit do cache."""
        hits = info.get('keyspace_hits', 0)
        misses = info.get('keyspace_misses', 0)
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0

# Instncia global do cache

class ModelCache:
    """
    Cache especfico para modelos Prophet.
    """
    
    TTL_MODEL = 3600 * 6  # 6 horas
    TTL_PREDICTION = 300  # 5 minutos
    TTL_PRODUCTS_LIST = 600  # 10 minutos
    
    @staticmethod
    def get_model(product_name: str):
        """Recupera modelo do cache."""
        key = get_cache()._generate_key("model", product_name)
        return get_cache().get(key)
    
    @staticmethod
    def set_model(product_name: str, model):
        """Armazena modelo no cache."""
        key = get_cache()._generate_key("model", product_name)
        return get_cache().set(key, model, ModelCache.TTL_MODEL)
    
    @staticmethod
    def get_prediction(product_name: str, days_ahead: int, **params):
        """Recupera predio do cache."""
        key = get_cache()._generate_key("prediction", product_name, days_ahead, **params)
        return get_cache().get(key)
    
    @staticmethod
    def set_prediction(product_name: str, days_ahead: int, prediction, **params):
        """Armazena predio no cache."""
        key = get_cache()._generate_key("prediction", product_name, days_ahead, **params)
        return get_cache().set(key, prediction, ModelCache.TTL_PREDICTION)
    
    @staticmethod
    def get_products_list() -> Optional[List[Dict]]:
        """Recupera lista de produtos do cache."""
        key = get_cache()._generate_key("products_list")
        return get_cache().get(key)
    
    @staticmethod
    def set_products_list(products: List[Dict]):
        """Armazena lista de produtos no cache."""
        key = get_cache()._generate_key("products_list")
        return get_cache().set(key, products, ModelCache.TTL_PRODUCTS_LIST)
    
    @staticmethod
    def invalidate_model(product_name: str):
        """Invalida cache do modelo e predies relacionadas."""
        # Remove modelo
        model_key = get_cache()._generate_key("model", product_name)
        get_cache().delete(model_key)
        
        # Remove predies relacionadas
        pattern = f"ai_module:*prediction*{product_name}*"
        get_cache().clear_pattern(pattern)
        
        logger.info(f"Cache invalidado para produto: {product_name}")
    
    @staticmethod
    def invalidate_all():
        """Invalida todo o cache do mdulo AI."""
        pattern = "ai_module:*"
        cleared = cache.clear_pattern(pattern)
        logger.info(f"Cache completo invalidado: {cleared} chaves removidas")
        return cleared

def cached_model():
    """
    Decorator para cache automtico de carregamento de modelos.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(product_name: str, *args, **kwargs):
            # Tenta buscar no cache primeiro
            cached_result = ModelCache.get_model(product_name)
            if cached_result is not None:
                logger.debug(f"Cache HIT para modelo: {product_name}")
                return cached_result
            
            # Se no encontrou, executa funo original
            logger.debug(f"Cache MISS para modelo: {product_name}")
            result = func(product_name, *args, **kwargs)
            
            # Armazena no cache se obteve resultado vlido
            if result is not None:
                ModelCache.set_model(product_name, result)
            
            return result
        return wrapper
    return decorator

def cached_prediction():
    """
    Decorator para cache automtico de predies.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(product_name: str, days_ahead: int = 1, *args, **kwargs):
            # Tenta buscar no cache primeiro
            cached_result = ModelCache.get_prediction(product_name, days_ahead, **kwargs)
            if cached_result is not None:
                logger.debug(f"Cache HIT para predio: {product_name} ({days_ahead} dias)")
                return cached_result
            
            # Se no encontrou, executa funo original
            logger.debug(f"Cache MISS para predio: {product_name} ({days_ahead} dias)")
            result = func(product_name, days_ahead, *args, **kwargs)
            
            # Armazena no cache se obteve resultado vlido
            if result is not None and isinstance(result, list):
                ModelCache.set_prediction(product_name, days_ahead, result, **kwargs)
            
            return result
        return wrapper
    return decorator

def get_cache_info() -> Dict[str, Any]:
    """
    Retorna informaes detalhadas sobre o cache.
    """
    stats = get_cache().get_stats()
    
    if get_cache().enabled:
        try:
            # Conta chaves por tipo
            model_keys = len(get_cache().redis_client.keys("ai_module:*model*"))
            prediction_keys = len(get_cache().redis_client.keys("ai_module:*prediction*"))
            other_keys = stats.get('ai_module_keys', 0) - model_keys - prediction_keys
            
            stats.update({
                "cache_breakdown": {
                    "models": model_keys,
                    "predictions": prediction_keys,
                    "other": other_keys
                },
                "ttl_settings": {
                    "models": f"{ModelCache.TTL_MODEL}s ({ModelCache.TTL_MODEL//3600}h)",
                    "predictions": f"{ModelCache.TTL_PREDICTION}s ({ModelCache.TTL_PREDICTION//60}min)",
                    "products_list": f"{ModelCache.TTL_PRODUCTS_LIST}s ({ModelCache.TTL_PRODUCTS_LIST//60}min)"
                }
            })
        except Exception as e:
            stats["breakdown_error"] = str(e)
    
    return stats

def warm_up_cache():
    """
    Pr-aquece o cache carregando modelos principais.
    """
    if not get_cache().enabled:
        logger.info("Cache no disponvel, pulando warm-up")
        return
    
    logger.info(" Iniciando warm-up do cache...")
    
    try:
        from product_name_utils import get_all_display_product_names
        from ai_service import load_model
        
        products = get_all_display_product_names()
        warmed_up = 0
        
        for product in products:
            try:
                model = load_model(product)
                if model is not None:
                    warmed_up += 1
                    logger.debug(f"Modelo pr-carregado: {product}")
            except Exception as e:
                logger.warning(f"Erro ao pr-carregar {product}: {e}")
        
        logger.info(f" Warm-up concludo: {warmed_up}/{len(products)} modelos carregados")
        
    except Exception as e:
        logger.error(f"Erro durante warm-up: {e}")

# Funo para health check do cache
def health_check() -> Dict[str, Any]:
    """
    Verifica sade do sistema de cache.
    """
    health = {
        "timestamp": datetime.now().isoformat(),
        "redis_available": get_cache().enabled,
        "status": "healthy" if get_cache().enabled else "degraded"
    }
    
    if get_cache().enabled:
        try:
            # Teste de escrita/leitura
            test_key = "ai_module:health_check"
            test_value = {"test": True, "timestamp": datetime.now().isoformat()}
            
            get_cache().set(test_key, test_value, 60)
            retrieved = get_cache().get(test_key)
            get_cache().delete(test_key)
            
            health.update({
                "read_write_test": retrieved == test_value,
                "stats": get_cache().get_stats()
            })
            
        except Exception as e:
            health.update({
                "status": "unhealthy",
                "error": str(e)
            })
    
    return health

# Instncia global do cache (lazy loading)
cache = None

def get_cache():
    """Retorna a instncia do cache, criando se necessrio."""
    global cache
    if cache is None:
        cache = RedisCache()
    return cache
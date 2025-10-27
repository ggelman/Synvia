#!/usr/bin/env python3
"""
Documentao Swagger/OpenAPI para Sistema AI
===========================================

Implementao completa de documentao interativa das APIs
usando Flask-RESTX (Swagger/OpenAPI 3.0).
"""

from flask import Flask
from flask_restx import Api, Resource, fields, Namespace
from flask_cors import CORS
from datetime import datetime
import json

# Configurao da documentao
authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-KEY'
    }
}

# Inicializao da API com documentao
api = Api(
    version='1.0.0',
    title='Sistema AI do Synvia - API Documentation',
    description='''
#  Sistema AI do Synvia

## Viso Geral
Sistema de Inteligncia Artificial completo para predio de demanda, 
gerao de insights e anlise de dados de vendas do Synvia.

## Funcionalidades Principais
-  **Predio de Demanda**: Algoritmos ML para previso de vendas
-  **Gerao de Insights**: IA para anlise estratgica  
-  **Cache Inteligente**: Sistema Redis com fallback graceful
-  **Monitoramento**: Logging estruturado e mtricas em tempo real
-  **Tratamento de Erros**: Framework robusto com retry logic
-  **Health Checks**: Verificao avanada de componentes

## Arquitetura
- **Framework**: Flask + Redis + MySQL
- **ML**: Prophet + Scikit-learn
- **IA**: Google Gemini + OpenAI
- **Monitoramento**: Structured Logging + psutil
- **Cache**: Redis com fallback para arquivos locais

## Autenticao
Algumas APIs podem requerer autenticao via header `X-API-KEY`.

## Rate Limiting
- APIs de predio: 100 requests/minuto
- APIs de insights: 50 requests/minuto  
- APIs de monitoramento: 200 requests/minuto

## Cdigos de Status
- `200` - Sucesso
- `400` - Requisio invlida
- `401` - No autorizado
- `404` - Recurso no encontrado
- `429` - Rate limit excedido
- `500` - Erro interno do servidor
- `503` - Servio indisponvel
    ''',
    doc='/docs/',
    authorizations=authorizations,
    security='apikey'
)

# Namespaces para organizao
ns_ai = Namespace('ai', description='APIs de Inteligncia Artificial')
ns_data = Namespace('data', description='APIs de Dados e Coleta')
ns_monitoring = Namespace('monitoring', description='APIs de Monitoramento')
ns_health = Namespace('health', description='APIs de Health Check')
ns_cache = Namespace('cache', description='APIs de Cache')

# Modelos de dados para documentao
error_model = api.model('Error', {
    'status': fields.String(required=True, description='Status da resposta', example='error'),
    'message': fields.String(required=True, description='Mensagem de erro', example='Produto no encontrado'),
    'error_code': fields.String(description='Cdigo especfico do erro', example='PRODUCT_NOT_FOUND'),
    'timestamp': fields.DateTime(description='Timestamp do erro', example='2025-10-01T12:00:00Z')
})

success_model = api.model('Success', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'message': fields.String(description='Mensagem de sucesso', example='Operao executada com sucesso'),
    'timestamp': fields.DateTime(description='Timestamp da resposta', example='2025-10-01T12:00:00Z')
})

# Modelos para AI
prediction_request = api.model('PredictionRequest', {
    'product_name': fields.String(required=True, description='Nome do produto', example='Bolo_de_Chocolate'),
    'days': fields.Integer(required=True, description='Nmero de dias para predio (1-30)', example=7, min=1, max=30),
    'confidence_interval': fields.Float(description='Intervalo de confiana (0.8-0.99)', example=0.95, min=0.8, max=0.99)
})

prediction_response = api.model('PredictionResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'product_name': fields.String(required=True, description='Nome do produto', example='Bolo_de_Chocolate'),
    'prediction': fields.List(fields.Float, required=True, description='Valores preditos', example=[65.2, 68.1, 72.3]),
    'confidence_intervals': fields.Raw(description='Intervalos de confiana'),
    'model_info': fields.Raw(description='Informaes do modelo usado'),
    'prediction_date': fields.DateTime(description='Data da predio'),
    'cache_hit': fields.Boolean(description='Se a predio veio do cache', example=False)
})

insight_request = api.model('InsightRequest', {
    'prompt': fields.String(required=True, description='Prompt para gerao de insight', 
                           example='Analise as vendas de bolo de chocolate dos ltimos 7 dias'),
    'context_data': fields.Raw(description='Dados de contexto para anlise'),
    'max_tokens': fields.Integer(description='Mximo de tokens na resposta (100-2000)', example=500, min=100, max=2000),
    'model': fields.String(description='Modelo de IA a usar', example='gemini', enum=['gemini', 'openai'])
})

insight_response = api.model('InsightResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'insight': fields.String(required=True, description='Insight gerado pela IA'),
    'model_used': fields.String(description='Modelo de IA utilizado', example='gemini'),
    'token_count': fields.Integer(description='Nmero de tokens utilizados', example=234),
    'generation_time': fields.Float(description='Tempo de gerao em segundos', example=1.45),
    'cache_hit': fields.Boolean(description='Se o insight veio do cache', example=False)
})

# Modelos para dados
products_response = api.model('ProductsResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'products': fields.List(fields.String, required=True, description='Lista de produtos', 
                           example=['Bolo_de_Chocolate', 'Brigadeiro_Gourmet', 'Cafe_Expresso']),
    'count': fields.Integer(description='Nmero total de produtos', example=10),
    'cache_hit': fields.Boolean(description='Se os dados vieram do cache', example=True)
})

sales_data_response = api.model('SalesDataResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'sales_data': fields.List(fields.Raw, required=True, description='Dados de vendas'),
    'period': fields.String(description='Perodo dos dados', example='last_30_days'),
    'total_records': fields.Integer(description='Total de registros', example=1500),
    'cache_hit': fields.Boolean(description='Se os dados vieram do cache', example=False)
})

# Modelos para monitoramento
health_metric = api.model('HealthMetric', {
    'name': fields.String(required=True, description='Nome da mtrica', example='cpu_usage'),
    'value': fields.Float(required=True, description='Valor da mtrica', example=45.2),
    'unit': fields.String(required=True, description='Unidade da mtrica', example='%'),
    'status': fields.String(required=True, description='Status da mtrica', example='healthy', 
                           enum=['healthy', 'warning', 'critical', 'unknown']),
    'threshold_warning': fields.Float(description='Limite para warning', example=70.0),
    'threshold_critical': fields.Float(description='Limite para critical', example=90.0),
    'message': fields.String(description='Mensagem adicional')
})

component_health = api.model('ComponentHealth', {
    'name': fields.String(required=True, description='Nome do componente', example='MySQL Database'),
    'type': fields.String(required=True, description='Tipo do componente', example='database',
                         enum=['database', 'cache', 'api_external', 'ml_model', 'system', 'service']),
    'status': fields.String(required=True, description='Status do componente', example='healthy',
                           enum=['healthy', 'warning', 'critical', 'unknown', 'unavailable']),
    'response_time': fields.Float(required=True, description='Tempo de resposta em segundos', example=0.123),
    'uptime_percentage': fields.Float(required=True, description='Porcentagem de uptime', example=99.5),
    'metrics': fields.List(fields.Nested(health_metric), description='Mtricas do componente'),
    'error_message': fields.String(description='Mensagem de erro se houver'),
    'last_check': fields.DateTime(description='ltimo check realizado')
})

health_check_response = api.model('HealthCheckResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'overall_status': fields.String(required=True, description='Status geral do sistema', example='healthy',
                                   enum=['healthy', 'warning', 'critical', 'unknown']),
    'components': fields.List(fields.Nested(component_health), required=True, description='Status dos componentes'),
    'system_metrics': fields.List(fields.Nested(health_metric), description='Mtricas do sistema'),
    'summary': fields.Raw(description='Resumo dos componentes'),
    'alerts': fields.List(fields.String, description='Alertas ativos'),
    'timestamp': fields.DateTime(description='Timestamp do check')
})

# Modelos para cache
cache_stats = api.model('CacheStats', {
    'total_requests': fields.Integer(description='Total de requisies', example=1500),
    'cache_hits': fields.Integer(description='Hits do cache', example=1200),
    'cache_misses': fields.Integer(description='Misses do cache', example=300),
    'hit_rate': fields.Float(description='Taxa de hit (%)', example=80.0),
    'total_keys': fields.Integer(description='Total de chaves', example=45),
    'memory_usage': fields.String(description='Uso de memria', example='12.5MB'),
    'uptime': fields.String(description='Tempo online', example='2h 30m')
})

cache_response = api.model('CacheResponse', {
    'status': fields.String(required=True, description='Status da resposta', example='success'),
    'cache_status': fields.String(description='Status do cache', example='available'),
    'stats': fields.Nested(cache_stats, description='Estatsticas do cache'),
    'timestamp': fields.DateTime(description='Timestamp da consulta')
})

# Registra namespaces
api.add_namespace(ns_ai, path='/api/ai')
api.add_namespace(ns_data, path='/api/data')
api.add_namespace(ns_monitoring, path='/api/monitoring')
api.add_namespace(ns_health, path='/api/health')
api.add_namespace(ns_cache, path='/api/cache')

# ==================== NAMESPACE AI ====================
@ns_ai.route('/predict')
class PredictDemand(Resource):
    @ns_ai.doc('predict_demand',
              description='Prediz a demanda de um produto usando modelos de Machine Learning',
              responses={
                  200: ('Predio realizada com sucesso', prediction_response),
                  400: ('Parmetros invlidos', error_model),
                  404: ('Produto no encontrado', error_model),
                  500: ('Erro interno', error_model)
              })
    @ns_ai.expect(prediction_request, validate=True)
    @ns_ai.marshal_with(prediction_response)
    def post(self):
        """
        Prediz a demanda de vendas para um produto especfico.
        
        Utiliza modelos Prophet treinados para gerar predies precisas
        com intervalos de confiana configurveis.
        
        **Exemplo de uso:**
        ```python
        import requests
        
        response = requests.post('/api/ai/predict', json={
            'product_name': 'Bolo_de_Chocolate',
            'days': 7,
            'confidence_interval': 0.95
        })
        ```
        
        **Produtos disponveis:**
        - Bolo_de_Chocolate
        - Brigadeiro_Gourmet  
        - Cafe_Expresso
        - Pao_Frances
        - Croissant
        """
        pass

@ns_ai.route('/predict-all')
class PredictAllProducts(Resource):
    @ns_ai.doc('predict_all_products',
              description='Prediz a demanda para todos os produtos disponveis',
              responses={
                  200: ('Predies realizadas com sucesso', api.model('PredictAllResponse', {
                      'status': fields.String(example='success'),
                      'predictions': fields.Raw(description='Predies por produto'),
                      'total_products': fields.Integer(example=10),
                      'successful_predictions': fields.Integer(example=8),
                      'failed_predictions': fields.List(fields.String, example=['Produto_X']),
                      'cache_hits': fields.Integer(example=3)
                  })),
                  500: ('Erro interno', error_model)
              })
    @ns_ai.expect(api.model('PredictAllRequest', {
        'days': fields.Integer(required=True, description='Dias para predio', example=7, min=1, max=30)
    }), validate=True)
    def post(self):
        """
        Prediz a demanda para todos os produtos cadastrados no sistema.
        
        Executa predies em paralelo para otimizar performance.
        Retorna tanto sucessos quanto falhas para transparncia.
        """
        pass

@ns_ai.route('/generate-insight')
class GenerateInsight(Resource):
    @ns_ai.doc('generate_insight',
              description='Gera insights usando IA baseado em dados e contexto fornecidos',
              responses={
                  200: ('Insight gerado com sucesso', insight_response),
                  400: ('Prompt invlido', error_model),
                  401: ('API key invlida', error_model),
                  429: ('Rate limit excedido', error_model),
                  500: ('Erro interno', error_model)
              })
    @ns_ai.expect(insight_request, validate=True)
    @ns_ai.marshal_with(insight_response)
    def post(self):
        """
        Gera insights estratgicos usando IA.
        
        Suporta mltiplos modelos de IA e pode incorporar
        dados de contexto para anlises mais precisas.
        
        **Exemplos de prompts:**
        - "Analise o padro de vendas de bolos nos finais de semana"
        - "Sugira estratgias para aumentar vendas de caf"
        - "Identifique produtos com maior potencial de crescimento"
        """
        pass

# ==================== NAMESPACE DATA ====================
@ns_data.route('/products')
class Products(Resource):
    @ns_data.doc('get_products',
                description='Lista todos os produtos disponveis no sistema',
                responses={
                    200: ('Produtos listados com sucesso', products_response),
                    500: ('Erro interno', error_model)
                })
    @ns_data.marshal_with(products_response)
    def get(self):
        """
        Retorna lista completa de produtos cadastrados.
        
        Os dados so automaticamente cacheados para melhor performance.
        """
        pass

@ns_data.route('/sales-data')
class SalesData(Resource):
    @ns_data.doc('get_sales_data',
                description='Obtm dados histricos de vendas',
                responses={
                    200: ('Dados obtidos com sucesso', sales_data_response),
                    400: ('Parmetros invlidos', error_model),
                    500: ('Erro interno', error_model)
                })
    @ns_data.expect(api.parser().add_argument('product_name', type=str, help='Nome do produto (opcional)')
                                  .add_argument('start_date', type=str, help='Data inicial (YYYY-MM-DD)')
                                  .add_argument('end_date', type=str, help='Data final (YYYY-MM-DD)')
                                  .add_argument('limit', type=int, help='Limite de registros (padro: 1000)'))
    @ns_data.marshal_with(sales_data_response)
    def get(self):
        """
        Obtm dados histricos de vendas com filtros opcionais.
        
        **Parmetros de consulta:**
        - `product_name`: Filtrar por produto especfico
        - `start_date`: Data inicial (formato: YYYY-MM-DD)
        - `end_date`: Data final (formato: YYYY-MM-DD)  
        - `limit`: Nmero mximo de registros (padro: 1000)
        """
        pass

@ns_data.route('/update-data')
class UpdateData(Resource):
    @ns_data.doc('update_data',
                description='Atualiza dados de vendas e retreina modelos',
                responses={
                    200: ('Dados atualizados com sucesso', success_model),
                    500: ('Erro na atualizao', error_model)
                })
    @ns_data.marshal_with(success_model)
    def post(self):
        """
        Fora atualizao dos dados de vendas e retreinamento dos modelos ML.
        
        **Processo:**
        1. Coleta novos dados do banco
        2. Processa e limpa os dados  
        3. Retreina modelos Prophet
        4. Invalida cache relacionado
        5. Gera log de auditoria
        """
        pass

# ==================== NAMESPACE MONITORING ====================
@ns_monitoring.route('/metrics')
class Metrics(Resource):
    @ns_monitoring.doc('get_metrics',
                      description='Obtm mtricas de performance do sistema',
                      responses={
                          200: ('Mtricas obtidas com sucesso', api.model('MetricsResponse', {
                              'status': fields.String(example='success'),
                              'metrics': fields.Raw(description='Mtricas do sistema'),
                              'timestamp': fields.DateTime()
                          })),
                          500: ('Erro interno', error_model)
                      })
    def get(self):
        """
        Retorna mtricas detalhadas de performance do sistema.
        
        **Mtricas includas:**
        - CPU, memria, disco
        - Tempos de resposta das APIs
        - Performance do cache
        - Estatsticas de ML
        """
        pass

@ns_monitoring.route('/dashboard')
class Dashboard(Resource):
    @ns_monitoring.doc('get_dashboard_data',
                      description='Obtm dados completos para dashboard de monitoramento')
    def get(self):
        """
        Retorna dados agregados para dashboard de monitoramento.
        
        Inclui mtricas, health checks e estatsticas em tempo real.
        """
        pass

# ==================== NAMESPACE HEALTH ====================
@ns_health.route('/robust')
class RobustHealthCheck(Resource):
    @ns_health.doc('robust_health_check',
                  description='Executa health check robusto de todos os componentes',
                  responses={
                      200: ('Health check executado com sucesso', health_check_response),
                      500: ('Erro no health check', error_model)
                  })
    @ns_health.marshal_with(health_check_response)
    def get(self):
        """
        Executa verificao completa da sade do sistema.
        
        **Componentes verificados:**
        - Database (MySQL)
        - Cache (Redis)
        - Modelos ML
        - APIs externas
        - Recursos do sistema
        
        **Mtricas coletadas:**
        - Tempo de resposta
        - Disponibilidade
        - Performance
        - Uso de recursos
        """
        pass

@ns_health.route('/summary')
class HealthSummary(Resource):
    @ns_health.doc('health_summary',
                  description='Obtm resumo rpido da sade do sistema')
    def get(self):
        """
        Retorna resumo rpido da sade geral do sistema.
        
        Ideal para checks frequentes e dashboards.
        """
        pass

@ns_health.route('/components/<string:component_name>/history')
class ComponentHistory(Resource):
    @ns_health.doc('component_history',
                  description='Obtm histrico de health checks de um componente',
                  params={'component_name': 'Nome do componente'})
    @ns_health.expect(api.parser().add_argument('limit', type=int, help='Limite de registros'))
    def get(self, component_name):
        """
        Retorna histrico de health checks para um componente especfico.
        
        **Componentes disponveis:**
        - database
        - cache  
        - ml_models
        - external_apis
        - system
        """
        pass

@ns_health.route('/alerts')
class HealthAlerts(Resource):
    @ns_health.doc('health_alerts',
                  description='Obtm histrico de alertas de sade')
    @ns_health.expect(api.parser().add_argument('limit', type=int, help='Limite de registros'))
    def get(self):
        """
        Retorna histrico de alertas gerados pelo sistema de monitoramento.
        
        Alertas so categorizados em:
        - CRITICAL: Falhas que afetam funcionalidade
        - WARNING: Degradao de performance
        """
        pass

# ==================== NAMESPACE CACHE ====================
@ns_cache.route('/status')
class CacheStatus(Resource):
    @ns_cache.doc('cache_status',
                 description='Obtm status e estatsticas do cache Redis',
                 responses={
                     200: ('Status obtido com sucesso', cache_response),
                     500: ('Erro ao acessar cache', error_model)
                 })
    @ns_cache.marshal_with(cache_response)
    def get(self):
        """
        Retorna status atual e estatsticas do sistema de cache.
        
        **Informaes includas:**
        - Taxa de hit/miss
        - Nmero de chaves
        - Uso de memria
        - Tempo de uptime
        """
        pass

@ns_cache.route('/clear')
class ClearCache(Resource):
    @ns_cache.doc('clear_cache',
                 description='Limpa todo o cache ou categorias especficas',
                 responses={
                     200: ('Cache limpo com sucesso', success_model),
                     500: ('Erro ao limpar cache', error_model)
                 })
    @ns_cache.expect(api.model('ClearCacheRequest', {
        'category': fields.String(description='Categoria para limpar (opcional)', 
                                 example='predictions', 
                                 enum=['all', 'predictions', 'insights', 'sales_data', 'products'])
    }))
    def post(self):
        """
        Limpa cache completo ou por categoria especfica.
        
        **Categorias disponveis:**
        - all: Limpa todo o cache
        - predictions: Apenas predies  
        - insights: Apenas insights de IA
        - sales_data: Dados de vendas
        - products: Lista de produtos
        """
        pass

# Funo para criar app Flask com documentao
def create_documented_app():
    """Cria aplicao Flask com documentao Swagger completa."""
    app = Flask(__name__)
    app.config['RESTX_MASK_SWAGGER'] = False
    app.config['RESTX_VALIDATE'] = True
    
    CORS(app)
    api.init_app(app)
    
    return app

# Endpoint adicional para OpenAPI spec
@api.route('/openapi.json')
class OpenAPISpec(Resource):
    def get(self):
        """Retorna especificao OpenAPI em formato JSON."""
        return api.__schema__

if __name__ == '__main__':
    # Cria app com documentao
    app = create_documented_app()
    
    print(" Documentao Swagger disponvel em:")
    print(" http://localhost:5002/docs/")
    print(" OpenAPI Spec: http://localhost:5002/openapi.json")
    
    app.run(host='0.0.0.0', port=5002, debug=True)


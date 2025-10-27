#!/usr/bin/env python3
"""
Documentao API HTML Simples
=============================

Documentao interativa das APIs usando HTML puro.
"""

from flask import Flask, render_template_string, jsonify
from flask_cors import CORS
from datetime import datetime

def create_docs_app():
    """Cria aplicao Flask com documentao HTML."""
    app = Flask(__name__)
    CORS(app)
    
    # Template HTML simples
    html_template = '''
<!DOCTYPE html>
<html>
<head>
    <title>Sistema AI do Synvia - API Docs</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .endpoint { border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; overflow: hidden; }
        .endpoint-header { background: #f8f9fa; padding: 15px; cursor: pointer; }
        .endpoint-details { padding: 20px; display: none; background: #fff; }
        .method { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; margin-right: 10px; }
        .get { background: #28a745; }
        .post { background: #007bff; }
        .code { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; overflow-x: auto; }
        .nav-tabs { display: flex; margin-bottom: 20px; }
        .nav-tab { padding: 10px 20px; background: #e9ecef; border: none; cursor: pointer; margin-right: 5px; border-radius: 5px 5px 0 0; }
        .nav-tab.active { background: #007bff; color: white; }
        .section { display: none; }
        .section.active { display: block; }
        .test-form { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; }
        .btn { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        .response { margin-top: 20px; padding: 15px; border-radius: 5px; }
        .response.success { background: #d1ecf1; border: 1px solid #bee5eb; }
        .response.error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .feature-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Sistema AI do Synvia</h1>
            <p>Documentao Completa das APIs - Verso 1.0.0</p>
            <div style="text-align: center; margin-top: 15px;">
                <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px; margin: 0 10px;"> Online</span>
                <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px; margin: 0 10px;">v1.0.0</span>
                <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px; margin: 0 10px;">25+ Endpoints</span>
            </div>
        </div>
        
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showSection('overview')"> Viso Geral</button>
            <button class="nav-tab" onclick="showSection('ai')"> APIs de IA</button>
            <button class="nav-tab" onclick="showSection('data')"> Dados</button>
            <button class="nav-tab" onclick="showSection('health')"> Health</button>
            <button class="nav-tab" onclick="showSection('test')"> Teste</button>
        </div>
        
        <!-- Viso Geral -->
        <div id="overview" class="section active">
            <h2> Viso Geral</h2>
            <p>Sistema de IA completo para predio de demanda e anlise de dados de vendas.</p>
            
            <div class="feature-grid">
                <div class="feature-card">
                    <h3> Inteligncia Artificial</h3>
                    <ul>
                        <li>Predio com Prophet</li>
                        <li>Insights via Gemini/OpenAI</li>
                        <li>Anlise de padres</li>
                        <li>Recomendaes automticas</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3> Anlise de Dados</h3>
                    <ul>
                        <li>Coleta automtica</li>
                        <li>Processamento real-time</li>
                        <li>Histrico completo</li>
                        <li>Mtricas de performance</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3> Cache Inteligente</h3>
                    <ul>
                        <li>Redis com fallback</li>
                        <li>TTL configurvel</li>
                        <li>Hit rate > 80%</li>
                        <li>Invalidao automtica</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3> Monitoramento</h3>
                    <ul>
                        <li>Health checks robustos</li>
                        <li>Logging estruturado</li>
                        <li>Mtricas em tempo real</li>
                        <li>Alertas automticos</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- APIs de IA -->
        <div id="ai" class="section">
            <h2> APIs de Inteligncia Artificial</h2>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('predict-details')">
                    <span class="method post">POST</span>
                    <strong>/api/ai/predict</strong> - Predio de demanda
                </div>
                <div id="predict-details" class="endpoint-details">
                    <h4>Descrio</h4>
                    <p>Prediz vendas usando modelos Prophet treinados.</p>
                    
                    <h4>Parmetros</h4>
                    <div class="code">
{
  "product_name": "Bolo_de_Chocolate",
  "days": 7,
  "confidence_interval": 0.95
}</div>
                    
                    <h4>Resposta</h4>
                    <div class="code">
{
  "status": "success",
  "product_name": "Bolo_de_Chocolate",
  "prediction": [65.2, 68.1, 72.3, 70.5, 73.8, 75.2, 69.1],
  "confidence_intervals": {...},
  "model_info": {...},
  "cache_hit": false
}</div>
                    
                    <h4>Produtos Disponveis</h4>
                    <ul>
                        <li>Bolo_de_Chocolate</li>
                        <li>Brigadeiro_Gourmet</li>
                        <li>Cafe_Expresso</li>
                        <li>Pao_Frances</li>
                        <li>Croissant</li>
                    </ul>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('insight-details')">
                    <span class="method post">POST</span>
                    <strong>/api/ai/generate-insight</strong> - Gerao de insights
                </div>
                <div id="insight-details" class="endpoint-details">
                    <h4>Descrio</h4>
                    <p>Gera insights estratgicos usando IA (Gemini/OpenAI).</p>
                    
                    <h4>Parmetros</h4>
                    <div class="code">
{
  "prompt": "Analise vendas de bolo dos ltimos 7 dias",
  "context_data": {...},
  "max_tokens": 500,
  "model": "gemini"
}</div>
                    
                    <h4>Exemplos de Prompts</h4>
                    <ul>
                        <li>"Analise padro de vendas nos finais de semana"</li>
                        <li>"Sugira estratgias para aumentar vendas de caf"</li>
                        <li>"Identifique produtos com maior potencial"</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- APIs de Dados -->
        <div id="data" class="section">
            <h2> APIs de Dados</h2>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('products-details')">
                    <span class="method get">GET</span>
                    <strong>/api/data/products</strong> - Lista produtos
                </div>
                <div id="products-details" class="endpoint-details">
                    <p>Retorna todos os produtos cadastrados. Dados cacheados automaticamente.</p>
                    <div class="code">
{
  "status": "success",
  "products": ["Bolo_de_Chocolate", "Brigadeiro_Gourmet", ...],
  "count": 10,
  "cache_hit": true
}</div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('sales-details')">
                    <span class="method get">GET</span>
                    <strong>/api/data/sales-data</strong> - Dados de vendas
                </div>
                <div id="sales-details" class="endpoint-details">
                    <h4>Parmetros de Query</h4>
                    <ul>
                        <li><code>product_name</code> - Produto especfico</li>
                        <li><code>start_date</code> - Data inicial (YYYY-MM-DD)</li>
                        <li><code>end_date</code> - Data final (YYYY-MM-DD)</li>
                        <li><code>limit</code> - Mx registros (padro: 1000)</li>
                    </ul>
                    
                    <h4>Exemplo</h4>
                    <div class="code">
GET /api/data/sales-data?product_name=Bolo_de_Chocolate&start_date=2025-09-01&limit=100</div>
                </div>
            </div>
        </div>
        
        <!-- Health Checks -->
        <div id="health" class="section">
            <h2> Health Checks</h2>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('health-robust-details')">
                    <span class="method get">GET</span>
                    <strong>/api/health/robust</strong> - Health check completo
                </div>
                <div id="health-robust-details" class="endpoint-details">
                    <h4>Componentes Verificados</h4>
                    <ul>
                        <li><strong>Database (MySQL)</strong> - Conectividade, latncia</li>
                        <li><strong>Cache (Redis)</strong> - Performance, hit rate</li>
                        <li><strong>Modelos ML</strong> - Disponibilidade, carregamento</li>
                        <li><strong>APIs Externas</strong> - Gemini, OpenAI</li>
                        <li><strong>Sistema</strong> - CPU, memria, disco</li>
                    </ul>
                    
                    <div class="code">
{
  "status": "success",
  "overall_status": "healthy",
  "components": [...],
  "summary": {
    "total_components": 5,
    "healthy_components": 4,
    "warning_components": 1,
    "critical_components": 0
  },
  "alerts": ["WARNING: Redis - Performance degraded"]
}</div>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="endpoint-header" onclick="toggleDetails('health-summary-details')">
                    <span class="method get">GET</span>
                    <strong>/api/health/summary</strong> - Resumo de sade
                </div>
                <div id="health-summary-details" class="endpoint-details">
                    <p>Resumo rpido ideal para checks frequentes e dashboards.</p>
                </div>
            </div>
        </div>
        
        <!-- Teste Interativo -->
        <div id="test" class="section">
            <h2> Teste Interativo</h2>
            
            <div class="test-form">
                <h3>Teste de Predio</h3>
                <div class="form-group">
                    <label>Produto:</label>
                    <select id="productSelect">
                        <option value="Bolo_de_Chocolate">Bolo de Chocolate</option>
                        <option value="Brigadeiro_Gourmet">Brigadeiro Gourmet</option>
                        <option value="Cafe_Expresso">Caf Expresso</option>
                        <option value="Pao_Frances">Po Francs</option>
                        <option value="Croissant">Croissant</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Dias:</label>
                    <input type="number" id="daysInput" min="1" max="30" value="7">
                </div>
                
                <div class="form-group">
                    <label>Intervalo de Confiana:</label>
                    <input type="number" id="confidenceInput" min="0.8" max="0.99" step="0.01" value="0.95">
                </div>
                
                <button class="btn" onclick="testPrediction()"> Testar Predio</button>
                
                <div id="predictionResult"></div>
            </div>
            
            <div class="test-form">
                <h3>Teste de Health Check</h3>
                <button class="btn" onclick="testHealth()"> Executar Health Check</button>
                <div id="healthResult"></div>
            </div>
        </div>
    </div>
    
    <script>
        function showSection(sectionId) {
            // Esconde todas as sees
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            
            // Mostra seo e ativa tab
            document.getElementById(sectionId).classList.add('active');
            event.target.classList.add('active');
        }
        
        function toggleDetails(detailsId) {
            const details = document.getElementById(detailsId);
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }
        
        async function testPrediction() {
            const product = document.getElementById('productSelect').value;
            const days = parseInt(document.getElementById('daysInput').value);
            const confidence = parseFloat(document.getElementById('confidenceInput').value);
            
            const resultDiv = document.getElementById('predictionResult');
            resultDiv.innerHTML = '<p> Executando predio...</p>';
            
            try {
                const response = await fetch('http://localhost:5001/api/ai/predict', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        product_name: product,
                        days: days,
                        confidence_interval: confidence
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    resultDiv.className = 'response success';
                    resultDiv.innerHTML = `
                        <h4> Predio Realizada</h4>
                        <p><strong>Produto:</strong> ${result.product_name}</p>
                        <p><strong>Predies:</strong> ${result.prediction?.slice(0,3).join(', ')}...</p>
                        <details>
                            <summary>Ver resposta completa</summary>
                            <pre>${JSON.stringify(result, null, 2)}</pre>
                        </details>
                    `;
                } else {
                    resultDiv.className = 'response error';
                    resultDiv.innerHTML = `<h4> Erro</h4><pre>${JSON.stringify(result, null, 2)}</pre>`;
                }
            } catch (error) {
                resultDiv.className = 'response error';
                resultDiv.innerHTML = `
                    <h4> Erro de Conexo</h4>
                    <p>Verifique se a API est rodando em http://localhost:5001</p>
                    <p>Erro: ${error.message}</p>
                `;
            }
        }
        
        async function testHealth() {
            const resultDiv = document.getElementById('healthResult');
            resultDiv.innerHTML = '<p> Executando health check...</p>';
            
            try {
                const response = await fetch('http://localhost:5001/api/health/robust');
                const result = await response.json();
                
                if (response.ok) {
                    resultDiv.className = 'response success';
                    resultDiv.innerHTML = `
                        <h4> Health Check Concludo</h4>
                        <p><strong>Status:</strong> ${result.overall_status}</p>
                        <p><strong>Componentes:</strong> ${result.summary?.healthy_components || 0}/${result.summary?.total_components || 0} saudveis</p>
                        <details>
                            <summary>Ver detalhes</summary>
                            <pre>${JSON.stringify(result, null, 2)}</pre>
                        </details>
                    `;
                } else {
                    resultDiv.className = 'response error';
                    resultDiv.innerHTML = `<h4> Erro</h4><pre>${JSON.stringify(result, null, 2)}</pre>`;
                }
            } catch (error) {
                resultDiv.className = 'response error';
                resultDiv.innerHTML = `
                    <h4> Erro de Conexo</h4>
                    <p>Verifique se a API est rodando em http://localhost:5001</p>
                `;
            }
        }
    </script>
</body>
</html>
    '''
    
    @app.route('/')
    def docs():
        """Pgina principal da documentao."""
        return render_template_string(html_template)
    
    @app.route('/api/status')
    def api_status():
        """Status da documentao."""
        return jsonify({
            "status": "online",
            "service": "API Documentation",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "real_api": "http://localhost:5001",
            "endpoints": {
                "ai_predict": "/api/ai/predict",
                "ai_insights": "/api/ai/generate-insight",
                "data_products": "/api/data/products",
                "health_robust": "/api/health/robust",
                "cache_status": "/api/cache/status"
            }
        })
    
    return app

if __name__ == '__main__':
    app = create_docs_app()
    
    print(" Documentao API Ativa!")
    print("=" * 50)
    print(" Documentao: http://localhost:5002")
    print(" Status: http://localhost:5002/api/status")
    print(" API Real: http://localhost:5001")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5002, debug=True)

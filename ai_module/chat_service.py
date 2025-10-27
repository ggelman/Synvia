from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
import os
import requests
from datetime import datetime
import logging
import time

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

# Configurao do OpenAI
openai.api_key = os.environ.get("OPENAI_API_KEY")
openai.api_base = os.environ.get("OPENAI_API_BASE")

# URLs dos servios
BACKEND_API_URL = "http://localhost:8080/api"
AI_SERVICE_URL = "http://localhost:5001/api/ai"

def get_business_context():
    """Obtm contexto atual do negcio atravs das APIs."""
    try:
        context = {}
        
        # Buscar dados de vendas recentes
        try:
            vendas_response = requests.get(f"{BACKEND_API_URL}/vendas/historico", timeout=5)
            if vendas_response.status_code == 200:
                vendas = vendas_response.json()
                context['total_vendas'] = len(vendas)
                context['vendas_recentes'] = vendas[:5] if vendas else []
        except:
            context['vendas_recentes'] = []
        
        # Buscar dados de estoque
        try:
            produtos_response = requests.get(f"{BACKEND_API_URL}/produtos", timeout=5)
            if produtos_response.status_code == 200:
                produtos = produtos_response.json()
                context['total_produtos'] = len(produtos)
                context['produtos_baixo_estoque'] = [p for p in produtos if p.get('qtdAtual', 0) < p.get('qtdMinima', 0)]
        except:
            context['produtos_baixo_estoque'] = []
        
        # Buscar dados financeiros
        try:
            from datetime import date
            hoje = date.today()
            primeiro_dia = hoje.replace(day=1)
            financeiro_response = requests.get(
                f"{BACKEND_API_URL}/relatorios/financeiro?inicio={primeiro_dia}&fim={hoje}", 
                timeout=5
            )
            if financeiro_response.status_code == 200:
                context['financeiro'] = financeiro_response.json()
        except:
            context['financeiro'] = {}
        
        return context
    except Exception as e:
        print(f"Erro ao obter contexto: {e}")
        return {}

def generate_smart_response(user_message, context):
    """Gera resposta inteligente usando OpenAI com contexto do negcio."""
    try:
        # Preparar contexto para o prompt
        context_text = f"""
        Contexto atual do Synvia Enterprises:
        - Total de vendas registradas: {context.get('total_vendas', 'N/A')}
        - Produtos com estoque baixo: {len(context.get('produtos_baixo_estoque', []))}
        - Receita do ms: R$ {context.get('financeiro', {}).get('receita', 0):.2f}
        - Despesas do ms: R$ {context.get('financeiro', {}).get('despesa', 0):.2f}
        - Lucro do ms: R$ {context.get('financeiro', {}).get('lucro', 0):.2f}
        """
        
        system_prompt = f"""
        Voc  um assistente inteligente especializado em gesto do Synvia. 
        Voc tem acesso aos dados em tempo real do Synvia Enterprises e pode fornecer insights valiosos.
        
        {context_text}
        
        Responda de forma til, prtica e especfica. Use os dados fornecidos quando relevante.
        Seja conciso mas informativo. Foque em aes prticas que o usurio pode tomar.
        """
        
        attempts = int(os.getenv('OPENAI_RETRIES', 2))
        for attempt in range(1, attempts + 2):
            try:
                logging.info(f'Calling OpenAI for chat (attempt {attempt})')
                response = openai.ChatCompletion.create(
                    model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )

                if hasattr(response.choices[0], 'message'):
                    return response.choices[0].message.content.strip()
                return getattr(response.choices[0], 'text', '').strip()
            except Exception as e:
                logging.exception(f'OpenAI chat attempt {attempt} failed: {e}')
                time.sleep(attempt * 1.0)
        # If all attempts fail, fallback
        logging.warning('OpenAI chat failed, using fallback response')
        return generate_fallback_response(user_message, context)
        
    except Exception as e:
        print(f"Erro na API OpenAI: {e}")
        return generate_fallback_response(user_message, context)

def generate_fallback_response(user_message, context):
    """Gera resposta baseada em regras quando a IA no est disponvel."""
    message = user_message.lower()
    
    if "vendas" in message or "venda" in message:
        total_vendas = context.get('total_vendas', 0)
        return f"Voc tem {total_vendas} vendas registradas no sistema. Para anlises detalhadas, acesse o relatrio de vendas no menu principal."
    
    if "estoque" in message or "produto" in message:
        produtos_baixo = len(context.get('produtos_baixo_estoque', []))
        if produtos_baixo > 0:
            return f" Ateno! Voc tem {produtos_baixo} produtos com estoque baixo que precisam de reposio. Acesse a Gesto de Estoque para mais detalhes."
        else:
            return " Seu estoque est em bom estado! Todos os produtos esto acima do nvel mnimo."
    
    if "financeiro" in message or "dinheiro" in message or "lucro" in message:
        financeiro = context.get('financeiro', {})
        receita = financeiro.get('receita', 0)
        lucro = financeiro.get('lucro', 0)
        return f" Situao financeira do ms: Receita de R$ {receita:.2f} e lucro de R$ {lucro:.2f}. Acesse o Dashboard Financeiro para anlise completa."
    
    if "previso" in message or "demanda" in message:
        return " Para previses de demanda baseadas em IA, acesse o mdulo 'Previso IA' no menu. L voc encontra previses para todos os produtos."
    
    if "cliente" in message or "fidelidade" in message:
        return " Para gerenciar clientes e o programa de fidelidade, acesse a seo 'Clientes' no menu principal."
    
    return "Entendi sua pergunta! Para informaes especficas, recomendo navegar pelos mdulos do sistema: Dashboard, Vendas, Estoque, Financeiro ou Relatrios. Cada seo tem dados detalhados sobre diferentes aspectos do negcio."

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    """Endpoint principal do chat com IA."""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Mensagem no pode estar vazia'}), 400
        
        # Obter contexto atual do negcio
        context = get_business_context()
        
        # Gerar resposta inteligente
        response = generate_smart_response(user_message, context)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'context_used': bool(context)
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/ai/chat/health', methods=['GET'])
def health():
    """Endpoint de sade do servio de chat."""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Chat Service',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)


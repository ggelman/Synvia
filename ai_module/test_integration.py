import requests
import json

def test_ai_service():
    """Testa o servio de IA diretamente."""
    base_url = "http://localhost:5001/api/ai"
    
    print("=== Testando Servio de IA ===")
    
    # Teste 1: Health check
    print("\n1. Testando health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print(" Health check OK:", response.json())
        else:
            print(" Health check falhou:", response.status_code)
    except Exception as e:
        print(" Erro no health check:", str(e))
    
    # Teste 2: Listar produtos disponveis
    print("\n2. Testando listagem de produtos...")
    try:
        response = requests.get(f"{base_url}/products")
        if response.status_code == 200:
            data = response.json()
            print(f" Produtos disponveis ({data['total']}): {data['products']}")
        else:
            print(" Listagem de produtos falhou:", response.status_code)
    except Exception as e:
        print(" Erro na listagem de produtos:", str(e))
    
    # Teste 3: Previso para um produto especfico
    print("\n3. Testando previso para produto especfico...")
    try:
        payload = {
            "product_name": "Po Francs",
            "days_ahead": 2
        }
        response = requests.post(f"{base_url}/predict", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f" Previso para {data['product_name']}:")
            for pred in data['predictions']:
                print(f"   {pred['date']}: {pred['predicted_demand']} unidades")
        else:
            print(" Previso especfica falhou:", response.status_code)
    except Exception as e:
        print(" Erro na previso especfica:", str(e))
    
    # Teste 4: Previso para todos os produtos
    print("\n4. Testando previso para todos os produtos...")
    try:
        response = requests.get(f"{base_url}/predict-all?days_ahead=1")
        if response.status_code == 200:
            data = response.json()
            print(f" Previses para {data['total_products']} produtos:")
            for produto, previsoes in data['predictions'].items():
                print(f"   {produto}: {previsoes[0]['predicted_demand']} unidades")
        else:
            print(" Previso geral falhou:", response.status_code)
    except Exception as e:
        print(" Erro na previso geral:", str(e))

def test_backend_integration():
    """Testa a integrao com o backend Spring Boot (se estiver rodando)."""
    base_url = "http://localhost:8080/api/ia"
    
    print("\n=== Testando Integrao com Backend ===")
    
    # Teste 1: Status da IA via backend
    print("\n1. Testando status da IA via backend...")
    try:
        response = requests.get(f"{base_url}/status")
        if response.status_code == 200:
            print(" Status via backend OK:", response.json())
        else:
            print(" Status via backend falhou:", response.status_code)
    except Exception as e:
        print(" Erro no status via backend (backend pode no estar rodando):", str(e))
    
    # Teste 2: Previses via backend
    print("\n2. Testando previses via backend...")
    try:
        response = requests.get(f"{base_url}/previsoes?diasAFrente=1")
        if response.status_code == 200:
            data = response.json()
            print(" Previses via backend OK")
            if 'predictions' in data:
                print(f"   Total de produtos: {data.get('total_products', 'N/A')}")
        else:
            print(" Previses via backend falharam:", response.status_code)
    except Exception as e:
        print(" Erro nas previses via backend (backend pode no estar rodando):", str(e))

if __name__ == '__main__':
    test_ai_service()
    test_backend_integration()
    
    print("\n=== Resumo dos Testes ===")
    print(" = Teste passou")
    print(" = Teste falhou")
    print("\nSe algum teste falhou:")
    print("- Verifique se o servio de IA est rodando na porta 5001")
    print("- Verifique se o backend Spring Boot est rodando na porta 8080")
    print("- Verifique se os modelos de IA foram treinados corretamente")


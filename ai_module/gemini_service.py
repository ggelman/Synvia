import os
import time
from dotenv import load_dotenv

try:
    import google.generativeai as genai
    _GENAI_AVAILABLE = True
except Exception:
    genai = None
    _GENAI_AVAILABLE = False


def configure_gemini():
    """Configura a API do Gemini com a chave de ambiente.

    Levanta ValueError se a chave no estiver presente.
    """
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("A varivel de ambiente GEMINI_API_KEY no foi definida.")
    if not _GENAI_AVAILABLE:
        raise RuntimeError("Biblioteca google.generativeai no est instalada.")
    genai.configure(api_key=api_key)


def _call_gemini(prompt_text, model_name='gemini-pro'):
    """Chamada baixa-nvel para gerar texto com Gemini.

    Retorna string com a resposta do modelo.
    """
    configure_gemini()
    model = genai.GenerativeModel(model_name)
    # Usar a interface pblica mais comum; verses da lib variam, ento
    # tentamos extrair texto de forma cautelosa.
    response = model.generate_content(prompt_text)

    # A estrutura do retorno pode mudar com verses. Tentamos vrias vias.
    if hasattr(response, 'text'):
        return response.text
    # resposta como objeto dict-like
    try:
        if isinstance(response, dict):
            # possveis chaves: 'candidates', 'result', 'output'
            if 'candidates' in response and response['candidates']:
                return response['candidates'][0].get('content', '')
            if 'result' in response and isinstance(response['result'], dict):
                return response['result'].get('content', '') or response['result'].get('output', '')
    except Exception:
        pass
    # Fallback genrico
    return str(response)


def generate_insights(prompt_text, retries=2, backoff_sec=1):
    """Envia prompt para Gemini com retries e fallback se no disponvel.

    Retorna: (success: bool, text: str, provider: str)
    - success: True se obteve resposta til
    - text: texto retornado (ou mensagem de erro)
    - provider: 'gemini' ou 'gemini-unavailable'
    """
    if not _GENAI_AVAILABLE:
        return False, "Gemini SDK no instalado no ambiente.", 'gemini-unavailable'

    last_exc = None
    for attempt in range(1, retries + 2):
        try:
            text = _call_gemini(prompt_text)
            # pequena validao do retorno
            if text and isinstance(text, str) and len(text.strip()) > 0:
                return True, text.strip(), 'gemini'
            else:
                last_exc = RuntimeError("Resposta vazia do Gemini")
        except Exception as e:
            last_exc = e
            time.sleep(backoff_sec * attempt)

    return False, f"Falha ao chamar Gemini: {last_exc}", 'gemini-unavailable'


if __name__ == '__main__':
    # Teste rpido (desenvolvimento)
    example_prompt = "Gere um breve texto de exemplo: por favor resuma 'Ol mundo' em 1 frase."
    ok, resp, provider = generate_insights(example_prompt)
    print(f"provider={provider} ok={ok}\n{resp}")

import logging
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Iterable, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class ProviderResponse:
    ok: bool
    content: Any
    provider: str
    metadata: Dict[str, Any] = field(default_factory=dict)


class LLMProvider:
    def __init__(self, name: str, handler: Callable[[str, Dict[str, Any]], ProviderResponse], weight: int = 1):
        self.name = name
        self._handler = handler
        self.weight = max(weight, 1)

    def invoke(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> ProviderResponse:
        options = options or {}
        return self._handler(prompt, options)


class LLMOrchestrator:
    def __init__(self, providers: Iterable[LLMProvider]):
        self.providers: List[LLMProvider] = list(providers)

    def generate(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> ProviderResponse:
        options = options or {}
        attempts: List[Dict[str, Any]] = []

        for provider in self.providers:
            start_time = time.perf_counter()
            try:
                logger.debug("Invocando provedor %s", provider.name)
                response = provider.invoke(prompt, options)
                latency_ms = (time.perf_counter() - start_time) * 1000
                attempts.append({
                    "provider": provider.name,
                    "success": response.ok,
                    "latency_ms": latency_ms,
                })

                if response.ok:
                    response.metadata.setdefault("latency_ms", latency_ms)
                    response.metadata.setdefault("attempts", attempts)
                    return response

                logger.warning("Resposta invlida do provedor %s", provider.name)
            except Exception as exc:  # pylint: disable=broad-except
                latency_ms = (time.perf_counter() - start_time) * 1000
                attempts.append({
                    "provider": provider.name,
                    "success": False,
                    "latency_ms": latency_ms,
                    "error": str(exc),
                })
                logger.exception("Falha ao chamar provedor %s", provider.name)

        logger.error("Todos os provedores falharam", extra={"attempts": attempts})
        return ProviderResponse(ok=False, content="Nenhuma resposta disponvel", provider="none", metadata={"attempts": attempts})


def build_orchestrator(providers: Iterable[LLMProvider]) -> LLMOrchestrator:
    ordered_providers = sorted(providers, key=lambda provider: provider.weight, reverse=True)
    return LLMOrchestrator(ordered_providers)

package br.com.godigital.llmgateway.service;

import java.time.Instant;
import java.util.Map;

public record PromptMessage(
        String id,
        String prompt,
        Map<String, Object> metadata,
        Instant createdAt
) {
}

package br.com.godigital.llmgateway.controller;

import br.com.godigital.llmgateway.service.PromptMessage;
import br.com.godigital.llmgateway.service.PromptQueueService;
import io.micrometer.observation.annotation.Observed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    private final PromptQueueService queueService;

    public PromptController(PromptQueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Observed(name = "llm.gateway.enqueue", contextualName = "enqueue-prompt")
    public PromptResponse enqueue(@Valid @RequestBody PromptRequest request) {
        PromptMessage message = queueService.enqueue(request.prompt(), request.metadataOrDefault());
        return PromptResponse.from(message);
    }

    @GetMapping("/next")
    @Observed(name = "llm.gateway.next", contextualName = "next-prompt")
    public ResponseEntity<PromptResponse> next() {
        Optional<PromptMessage> message = queueService.next();
        return message.map(value -> ResponseEntity.ok(PromptResponse.from(value)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/ack")
    @Observed(name = "llm.gateway.ack", contextualName = "ack-prompt")
    public ResponseEntity<Void> acknowledge(@PathVariable String id, @Valid @RequestBody AckRequest ackRequest) {
        boolean acknowledged = queueService.acknowledge(id, ackRequest.success());
        if (!acknowledged) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/metrics")
    public PromptQueueService.QueueSnapshot metrics() {
        return queueService.snapshot();
    }

    public record PromptRequest(@NotBlank String prompt, Map<String, Object> metadata) {
        public Map<String, Object> metadataOrDefault() {
            return metadata == null ? Map.of() : metadata;
        }
    }

    public record AckRequest(boolean success) { }

    public record PromptResponse(String id, String prompt, Map<String, Object> metadata, Instant createdAt) {
        static PromptResponse from(PromptMessage message) {
            return new PromptResponse(message.id(), message.prompt(), message.metadata(), message.createdAt());
        }
    }
}

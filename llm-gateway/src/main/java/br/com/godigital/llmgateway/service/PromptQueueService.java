package br.com.godigital.llmgateway.service;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PromptQueueService {

    private final ConcurrentLinkedQueue<PromptMessage> queue = new ConcurrentLinkedQueue<>();
    private final Map<String, PromptMessage> inFlight = new ConcurrentHashMap<>();
    private final AtomicLong totalEnqueued = new AtomicLong();
    private final AtomicLong totalDelivered = new AtomicLong();
    private final MeterRegistry meterRegistry;

    public PromptQueueService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        meterRegistry.gauge("llm.gateway.prompts.pending", queue, ConcurrentLinkedQueue::size);
    }

    public PromptMessage enqueue(String prompt, Map<String, Object> metadata) {
        String id = UUID.randomUUID().toString();
        PromptMessage message = new PromptMessage(id, prompt, metadata, Instant.now());
        queue.add(message);
        totalEnqueued.incrementAndGet();
        meterRegistry.counter("llm.gateway.prompts.total").increment();
        return message;
    }

    public Optional<PromptMessage> next() {
        PromptMessage message = queue.poll();
        if (message != null) {
            inFlight.put(message.id(), message);
            totalDelivered.incrementAndGet();
            recordLatency("dispatch", message.createdAt());
        }
        return Optional.ofNullable(message);
    }

    public boolean acknowledge(String id, boolean success) {
        PromptMessage message = inFlight.remove(id);
        if (message == null) {
            return false;
        }
        recordLatency(success ? "ack.success" : "ack.fail", message.createdAt());
        meterRegistry.counter("llm.gateway.prompts.ack", Tags.of("status", success ? "success" : "fail")).increment();
        return true;
    }

    public QueueSnapshot snapshot() {
        return new QueueSnapshot(
                queue.size(),
                inFlight.size(),
                totalEnqueued.get(),
                totalDelivered.get()
        );
    }

    private void recordLatency(String metric, Instant start) {
        double latency = Duration.between(start, Instant.now()).toMillis();
        meterRegistry.summary("llm.gateway.prompts.latency", Tags.of("stage", metric)).record(latency);
    }

    public record QueueSnapshot(int pending, int inFlight, long totalEnqueued, long totalDelivered) { }
}

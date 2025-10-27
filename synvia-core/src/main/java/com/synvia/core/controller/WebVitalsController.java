package com.synvia.core.controller;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.annotation.Observed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/status")
@CrossOrigin(origins = "*")
public class WebVitalsController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WebVitalsController.class);
    private static final String METRIC_NAME = "frontend.web_vitals";

    private final MeterRegistry meterRegistry;

    public WebVitalsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @PostMapping("/web-vitals")
    @Observed(name = "frontend.webvitals.ingest", contextualName = "web-vitals-ingest")
    public ResponseEntity<Void> registerWebVital(@Valid @RequestBody WebVitalPayload payload) {
        String sanitizedMetric = sanitize(payload.name());
        String sanitizedPage = sanitize(payload.page());

        DistributionSummary summary = meterRegistry.summary(METRIC_NAME,
                "metric", sanitizedMetric,
                "page", sanitizedPage,
                "rating", sanitize(payload.rating()));
        summary.record(payload.value());

        Counter counter = meterRegistry.counter(METRIC_NAME + ".count",
                "metric", sanitizedMetric,
                "page", sanitizedPage);
        counter.increment();

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("WebVitals metric received: {} value={} delta={} rating={} page={} ts={}",
                    sanitizedMetric, payload.value(), payload.delta(), payload.rating(), sanitizedPage, payload.timestamp());
        }

        return ResponseEntity.accepted().build();
    }

    private String sanitize(String value) {
        String sanitized = Objects.toString(value, "unknown").trim();
        if (sanitized.isEmpty()) {
            sanitized = "unknown";
        }
        if (sanitized.length() > 80) {
            return sanitized.substring(0, 80);
        }
        return sanitized;
    }

    public record WebVitalPayload(
            @NotBlank String id,
            @NotBlank String name,
            double value,
            double delta,
            String rating,
            String navigationType,
            String page,
            @NotNull Long timestamp,
            Map<String, Object> attribution
    ) {
        public Instant toInstant() {
            return Instant.ofEpochMilli(timestamp);
        }
    }
}

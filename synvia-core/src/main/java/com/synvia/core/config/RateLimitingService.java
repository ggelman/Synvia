package com.synvia.core.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // Get or create bucket for IP and endpoint type
    public Bucket resolveBucket(String key, BucketType bucketType) {
        return cache.computeIfAbsent(key + ":" + bucketType.name(), k -> {
            switch (bucketType) {
                case LOGIN:
                    return createLoginBucket();
                case API:
                    return createApiBucket();
                case AI:
                    return createAiBucket();
                case HEAVY_OPERATION:
                    return createHeavyOperationBucket();
                default:
                    return createApiBucket();
            }
        });
    }

    // Rate limiting for login endpoint: 5 requests per minute
    private Bucket createLoginBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build();
    }

    // Rate limiting for general API: 200 requests per minute (aumentado para desenvolvimento)
    private Bucket createApiBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(200, Refill.intervally(200, Duration.ofMinutes(1))))
                .build();
    }

    // Rate limiting for AI endpoints: 30 requests per minute (aumentado para testes)
    private Bucket createAiBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(30, Refill.intervally(30, Duration.ofMinutes(1))))
                .build();
    }

    // Rate limiting for heavy operations: 100 requests per hour (mais permissivo para desenvolvimento)
    private Bucket createHeavyOperationBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofHours(1))))
                .build();
    }

    public enum BucketType {
        LOGIN,
        API,
        AI,
        HEAVY_OPERATION
    }
}
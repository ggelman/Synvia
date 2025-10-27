package com.synvia.core.filter;

import com.synvia.core.config.RateLimitingService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    @Autowired
    private RateLimitingService rateLimitingService;
    
    @Value("${app.rate-limiting.enabled:true}")
    private boolean rateLimitingEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Se rate limiting estiver desabilitado, pular verificação
        if (!rateLimitingEnabled) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String clientIp = getClientIp(request);
        String requestPath = request.getRequestURI();
        
        // Determine bucket type based on endpoint
        RateLimitingService.BucketType bucketType = determineBucketType(requestPath);
        
        // Get bucket for this client IP and endpoint type
        Bucket bucket = rateLimitingService.resolveBucket(clientIp, bucketType);
        
        // Try to consume 1 token from the bucket
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            // Request allowed - add rate limiting headers
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            response.addHeader("X-Rate-Limit-Bucket-Type", bucketType.name());
            filterChain.doFilter(request, response);
        } else {
            // Request rejected - rate limit exceeded
            logger.warn("Rate limit exceeded for IP: {} on endpoint: {} (bucket: {})", 
                       clientIp, requestPath, bucketType);
            
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", 
                             String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            
            String jsonResponse = String.format(
                "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests for %s endpoints\",\"retryAfterSeconds\":%d}",
                bucketType.name().toLowerCase(),
                probe.getNanosToWaitForRefill() / 1_000_000_000
            );
            
            response.getWriter().write(jsonResponse);
        }
    }

    private RateLimitingService.BucketType determineBucketType(String path) {
        if (path.contains("/auth/login")) {
            return RateLimitingService.BucketType.LOGIN;
        } else if (path.contains("/ai/") || path.contains("/ia/")) {
            return RateLimitingService.BucketType.AI;
        } else if (path.contains("/backup") || path.contains("/reports") || path.contains("/relatorios")) {
            return RateLimitingService.BucketType.HEAVY_OPERATION;
        } else {
            return RateLimitingService.BucketType.API;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip rate limiting for static resources and health checks
        return path.startsWith("/actuator/") || 
               path.startsWith("/static/") || 
               path.startsWith("/css/") || 
               path.startsWith("/js/") || 
               path.startsWith("/images/") ||
               path.endsWith(".ico");
    }
}
package com.synvia.core.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PUBLIC_CARDAPIO_CACHE = "publicCardapio";
    public static final String PUBLIC_STATUS_CACHE = "publicStatus";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(PUBLIC_CARDAPIO_CACHE, PUBLIC_STATUS_CACHE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(5))
                .maximumSize(512)
                .recordStats());
        return cacheManager;
    }

    @Bean
    public FilterRegistrationBean<ShallowEtagHeaderFilter> shallowEtagHeaderFilter() {
        FilterRegistrationBean<ShallowEtagHeaderFilter> filter = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
        filter.addUrlPatterns("/public/*", "/status/*");
        filter.setName("etagFilter");
        filter.setOrder(Integer.MIN_VALUE);
        return filter;
    }
}

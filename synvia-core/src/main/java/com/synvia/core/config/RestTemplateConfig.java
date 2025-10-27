package com.synvia.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        try {
            // AVISO: Configuração apenas para desenvolvimento/teste
            // Em produção, use certificados válidos e validação adequada
            TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        // Retorna array vazio em vez de null para segurança
                        return new X509Certificate[0];
                    }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        // Implementação vazia - apenas para desenvolvimento
                        // TODO: Implementar validação adequada para produção
                    }
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        // Implementação vazia - apenas para desenvolvimento  
                        // TODO: Implementar validação adequada para produção
                    }
                }
            };

            // Usar TLS 1.2 ou superior para melhor segurança
            SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

            // Criar RestTemplate com timeout configurado
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(30000);
            factory.setReadTimeout(30000);
            
            return new RestTemplate(factory);
            
        } catch (Exception e) {
            // Em caso de erro, retornar RestTemplate padrão
            return new RestTemplate();
        }
    }
}
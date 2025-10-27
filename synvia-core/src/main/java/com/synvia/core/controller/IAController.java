package com.synvia.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ia")
@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3443"})
public class IAController {

    private static final String ERROR_KEY = "error";

    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;

    // Endpoint para obter previsões de todos os produtos
    @GetMapping("/previsoes")
    public ResponseEntity<Map<String, Object>> obterPrevisoes(@RequestParam(defaultValue = "1") int diasAFrente) {
        try {
            String url = aiServiceUrl + "/previsoes?dias_a_frente=" + diasAFrente;
            Object response = restTemplate.getForObject(url, Object.class);
            Map<String, Object> responseMap = convertToMap(response);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put(ERROR_KEY, "Erro ao obter previsões: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint para obter previsão de um produto específico
    @PostMapping("/previsao-produto")
    public ResponseEntity<Map<String, Object>> obterPrevisaoProduto(@RequestBody Map<String, Object> request) {
        try {
            String url = aiServiceUrl + "/predict";
            Object response = restTemplate.postForObject(url, request, Object.class);
            Map<String, Object> responseMap = convertToMap(response);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erro ao obter previsão do produto: " + e.getMessage()));
        }
    }

    // Endpoint para listar produtos disponíveis para previsão
    @GetMapping("/produtos-disponiveis")
    public ResponseEntity<Map<String, Object>> obterProdutosDisponiveis() {
        try {
            String url = aiServiceUrl + "/products";
            Object response = restTemplate.getForObject(url, Object.class);
            Map<String, Object> responseMap = convertToMap(response);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erro ao obter produtos disponíveis: " + e.getMessage()));
        }
    }

    // Endpoint para verificar status do serviço de IA
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> verificarStatusIA() {
        try {
            String url = aiServiceUrl + "/health";
            Object response = restTemplate.getForObject(url, Object.class);
            Map<String, Object> responseMap = convertToMap(response);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Serviço de IA indisponível: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> convertToMap(Object response) {
        if (response instanceof Map) {
            return (Map<String, Object>) response;
        }
        return new HashMap<>();
    }
}

package com.synvia.core.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getNotificationSettings() {
        System.out.println(">>> GET /api/notifications/settings foi chamado");

        Map<String, Boolean> settings = Map.of(
                "lowStock", true,
                "dailyReport", true,
                "weeklyReport", false,
                "backupComplete", true,
                "newUser", true,
                "systemAlerts", true);

        List<Map<String, String>> emailList = List.of(
                Map.of("id", "1", "email", "admin.platform@synvia.io", "role", "Administrador"),
                Map.of("id", "2", "email", "operacoes@synvia.io", "role", "Operações"));

        Map<String, Object> response = Map.of(
                "settings", settings,
                "emailList", emailList);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/settings")
    public ResponseEntity<Void> updateNotificationSettings(@RequestBody Map<String, Boolean> newSettings) {
        System.out.println(">>> POST /api/notifications/settings foi chamado com: " + newSettings);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/emails")
    public ResponseEntity<Map<String, String>> addNotificationEmail(@RequestBody Map<String, String> emailData) {
        String email = emailData.get("email");
        System.out.println(">>> POST /api/notifications/emails foi chamado para adicionar: " + email);

        // Em um app real, salvaríamos no banco e retornaríamos o objeto completo.
        // Aqui, apenas simulamos a resposta.
        Map<String, String> newEmailItem = Map.of(
                "id", String.valueOf(System.currentTimeMillis()), // ID falso
                "email", email,
                "role", emailData.getOrDefault("role", "Novo Usuário"));

        return ResponseEntity.status(HttpStatus.CREATED).body(newEmailItem);
    }

    // Endpoint FAKE para remover um email
    @DeleteMapping("/emails/{id}")
    public ResponseEntity<Void> removeNotificationEmail(@PathVariable String id) {
        System.out.println(">>> DELETE /api/notifications/emails/" + id + " foi chamado");
        // Em um app real, deletaríamos o email com este ID do banco.
        return ResponseEntity.ok().build();
    }

    // Endpoint FAKE para testar uma notificação
    @PostMapping("/test-notification")
    public ResponseEntity<Void> sendTestNotification(@RequestBody Map<String, Object> testData) {
        System.out.println(">>> POST /api/notifications/test-notification foi chamado com: " + testData);
        // Em um app real, aqui entraria a lógica de envio de email.
        return ResponseEntity.ok().build();
    }
}

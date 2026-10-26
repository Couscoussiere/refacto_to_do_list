package com.refactotodolist.auth.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.refactotodolist.auth.model.User;

// Crée le compte admin initial (ou promeut le compte existant) à partir de ADMIN_EMAIL / ADMIN_PASSWORD.
// Exécuté après les migrations (Migrator tourne en @PostConstruct).
@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private final AuthService authService;
    private final String email;
    private final String password;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);

    public AdminAccountInitializer(AuthService authService,
                                   @Value("${app.admin.email:}") String email,
                                   @Value("${app.admin.password:}") String password) {
        this.authService = authService;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureAdminAccount(email, password);
    }

    public void ensureAdminAccount(String rawEmail, String rawPassword) {
        if (rawEmail == null || rawEmail.isBlank() || rawPassword == null || rawPassword.isBlank()) return;

        String normalized = AuthService.normalizeEmail(rawEmail);
        Optional<User> existing = authService.getUserByEmail(normalized);
        if (existing.isPresent()) {
            if (!existing.get().isAdmin()) {
                authService.promoteToAdmin(existing.get().id());
            }
            return;
        }

        authService.createUser(normalized, "Admin", "Admin", bcrypt.encode(rawPassword), User.ROLE_ADMIN);
    }
}

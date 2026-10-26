package com.refactotodolist.auth.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.refactotodolist.auth.controller.GlobalExceptionHandler.InvalidJsonException;
import com.refactotodolist.auth.model.AuthContext;
import com.refactotodolist.auth.model.User;
import com.refactotodolist.auth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private static final Pattern EMAIL_REGEX = Pattern.compile("^[^\\s@]+@[^\\s@.]+\\.[^\\s@]+$");

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final AuthService authService;
    private final ObjectMapper objectMapper;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);

    public AuthController(AuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(HttpServletRequest req) throws IOException {
        Map<String, Object> body = readBody(req);
        String rawEmail = str(body, "email");
        String password = str(body, "password");
        String rawFirstName = str(body, "firstName");
        String rawLastName = str(body, "lastName");
        if (isEmpty(rawEmail) || isEmpty(password) || isEmpty(rawFirstName) || isEmpty(rawLastName)) {
            return missingFields("email, password, firstName, lastName are required", body, req);
        }

        String email = AuthService.normalizeEmail(rawEmail);
        String firstName = rawFirstName.strip();
        String lastName = rawLastName.strip();

        if (!EMAIL_REGEX.matcher(email).matches()) {
            return message(400, "Invalid email format");
        }

        // Vérification robustesse du mot de passe
        boolean passwordValid = password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*[0-9].*");
        if (!passwordValid) {
            return message(400,
                    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        }

        if (authService.getUserByEmail(email).isPresent()) {
            return message(409, "Email already registered");
        }

        String passwordHash = bcrypt.encode(password);
        User user = authService.createUser(email, firstName, lastName, passwordHash);

        String token = authService.signToken(String.valueOf(user.id()), user.email());
        return ResponseEntity.status(201).body(Map.of("user", user.toPublic(), "token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(HttpServletRequest req) throws IOException {
        Map<String, Object> body = readBody(req);
        String rawEmail = str(body, "email");
        String password = str(body, "password");
        if (isEmpty(rawEmail) || isEmpty(password)) {
            return missingFields("email and password are required", body, req);
        }

        Optional<User> user = authService.getUserByEmail(AuthService.normalizeEmail(rawEmail));
        if (user.isEmpty() || !bcrypt.matches(password, user.get().passwordHash())) {
            return message(401, "Invalid credentials");
        }

        String token = authService.signToken(String.valueOf(user.get().id()), user.get().email());
        return ResponseEntity.ok(Map.of("user", user.get().toPublic(), "token", token));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @RequestAttribute(name = AuthContext.REQUEST_ATTRIBUTE, required = false) AuthContext auth) {
        if (auth == null) {
            return message(401, "Unauthorized");
        }

        long userId;
        try {
            userId = Long.parseLong(auth.userId());
        } catch (NumberFormatException e) {
            return message(401, "Unauthorized");
        }

        Optional<User> user = authService.getUserById(userId);
        if (user.isEmpty()) {
            return message(404, "User not found");
        }

        return ResponseEntity.ok(Map.of("user", user.get().toPublic()));
    }

    // Équivalent de express.json() + express.urlencoded() : corps JSON, sinon paramètres de formulaire
    private Map<String, Object> readBody(HttpServletRequest req) throws IOException {
        String contentType = req.getContentType();
        if (contentType != null && MediaType.parseMediaType(contentType).isCompatibleWith(MediaType.APPLICATION_JSON)) {
            byte[] raw = req.getInputStream().readAllBytes();
            if (raw.length == 0) return null;
            try {
                JsonNode node = objectMapper.readTree(raw);
                return node != null && node.isObject() ? objectMapper.convertValue(node, MAP_TYPE) : null;
            } catch (JsonProcessingException e) {
                throw new InvalidJsonException(e);
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        req.getParameterMap().forEach((key, values) -> body.put(key, values.length > 0 ? values[0] : ""));
        return body;
    }

    private static ResponseEntity<Map<String, Object>> missingFields(
            String message, Map<String, Object> body, HttpServletRequest req) {
        Map<String, Object> received = new LinkedHashMap<>();
        received.put("contentType", req.getContentType());
        received.put("keys", body == null ? new ArrayList<>() : new ArrayList<>(body.keySet()));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", message);
        payload.put("received", received);
        return ResponseEntity.badRequest().body(payload);
    }

    private static ResponseEntity<Map<String, Object>> message(int status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    private static String str(Map<String, Object> body, String key) {
        if (body == null) return null;
        return body.get(key) instanceof String s ? s : null;
    }

    private static boolean isEmpty(String value) {
        return value == null || value.isEmpty();
    }
}

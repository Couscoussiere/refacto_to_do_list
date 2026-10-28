package com.refactotodolist.auth.middleware;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.refactotodolist.auth.config.JwtKeys;
import com.refactotodolist.auth.model.AuthContext;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequireAuthInterceptor implements HandlerInterceptor {

    private final JwtKeys jwtKeys;
    private final ObjectMapper objectMapper;

    public RequireAuthInterceptor(JwtKeys jwtKeys, ObjectMapper objectMapper) {
        this.jwtKeys = jwtKeys;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws IOException {
        // Laisse passer les preflight CORS
        if (HttpMethod.OPTIONS.matches(req.getMethod())) return true;

        String header = req.getHeader("Authorization");
        if (header == null || header.isEmpty()) {
            return unauthorized(res, "Missing Authorization header");
        }

        String[] parts = header.split(" ");
        if (!"Bearer".equals(parts[0]) || parts.length < 2 || parts[1].isEmpty()) {
            return unauthorized(res, "Invalid Authorization header");
        }

        try {
            var jws = Jwts.parser()
                    .verifyWith(jwtKeys.getPublicKey())
                    .build()
                    .parseSignedClaims(parts[1]);
            if (!JwtKeys.JWT_ALGORITHM.equals(jws.getHeader().getAlgorithm())) {
                return unauthorized(res, "Invalid token");
            }

            Claims claims = jws.getPayload();
            String sub = claims.getSubject();
            if (sub == null || sub.isEmpty()) {
                return unauthorized(res, "Invalid token");
            }

            req.setAttribute(AuthContext.REQUEST_ATTRIBUTE, new AuthContext(sub, claims.get("email", String.class), claims.get("role", String.class)));
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return unauthorized(res, "Invalid token");
        }
    }

    private boolean unauthorized(HttpServletResponse res, String message) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(res.getWriter(), Map.of("message", message));
        return false;
    }
}

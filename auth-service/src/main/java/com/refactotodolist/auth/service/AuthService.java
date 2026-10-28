package com.refactotodolist.auth.service;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;

import com.refactotodolist.auth.config.JwtKeys;
import com.refactotodolist.auth.model.User;

import io.jsonwebtoken.Jwts;

@Service
public class AuthService {

    private static final String SELECT_USER =
            "SELECT id, email, first_name, last_name, password_hash, role, created_at FROM users";

    // Format "ms" (60, "2 days", "10h", "7d"...) utilisé par jsonwebtoken pour JWT_EXPIRES_IN
    private static final Pattern DURATION =
            Pattern.compile("^(\\d+(?:\\.\\d+)?)\\s*(ms|s|m|h|d|w|y)?$", Pattern.CASE_INSENSITIVE);

    private final JdbcTemplate jdbc;
    private final JwtKeys jwtKeys;
    private final String expiresIn;

    public AuthService(JdbcTemplate jdbc, JwtKeys jwtKeys, @Value("${app.jwt.expires-in}") String expiresIn) {
        this.jdbc = jdbc;
        this.jwtKeys = jwtKeys;
        this.expiresIn = expiresIn;
    }

    public String signToken(String sub, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claim("sub", sub)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(parseExpiresIn(expiresIn))))
                .signWith(jwtKeys.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    public static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    public Optional<User> getUserByEmail(String email) {
        return first(jdbc.query(SELECT_USER + " WHERE email = ? LIMIT 1", AuthService::toUser, email));
    }

    public Optional<User> getUserById(long id) {
        return first(jdbc.query(SELECT_USER + " WHERE id = ? LIMIT 1", AuthService::toUser, id));
    }

    public List<User> listUsers() {
        return jdbc.query(SELECT_USER + " ORDER BY id", AuthService::toUser);
    }

    public User createUser(String email, String firstName, String lastName, String passwordHash) {
        return createUser(email, firstName, lastName, passwordHash, User.ROLE_STANDARD);
    }

    public User createUser(String email, String firstName, String lastName, String passwordHash, String role) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO users (email, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setString(1, email);
            ps.setString(2, firstName);
            ps.setString(3, lastName);
            ps.setString(4, passwordHash);
            ps.setString(5, role);
            return ps;
        }, keyHolder);

        Number insertId = keyHolder.getKey();
        if (insertId == null) {
            throw new IllegalStateException("User creation failed");
        }
        return getUserById(insertId.longValue())
                .orElseThrow(() -> new IllegalStateException("User creation failed"));
    }

    // Retourne true si une ligne a bien été supprimée
    public boolean deleteUserById(long id) {
        return jdbc.update("DELETE FROM users WHERE id = ?", id) > 0;
    }

    public void promoteToAdmin(long id) {
        jdbc.update("UPDATE users SET role = ? WHERE id = ?", User.ROLE_ADMIN, id);
    }

    // Fonction de mapping entre une ligne de la table users (BDD) et User (application)
    private static User toUser(ResultSet rs, int rowNum) throws SQLException {
        return new User(
                rs.getLong("id"),
                rs.getString("email"),
                rs.getString("first_name"),
                rs.getString("last_name"),
                rs.getString("password_hash"),
                User.ROLE_ADMIN.equals(rs.getString("role")) ? User.ROLE_ADMIN : User.ROLE_STANDARD,
                rs.getTimestamp("created_at").toInstant());
    }

    private static <T> Optional<T> first(List<T> rows) {
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    static Duration parseExpiresIn(String value) {
        Matcher m = DURATION.matcher(value.trim());
        if (!m.matches()) {
            throw new IllegalStateException("Invalid JWT_EXPIRES_IN: " + value);
        }
        double amount = Double.parseDouble(m.group(1));
        String unit = m.group(2) == null ? "ms" : m.group(2).toLowerCase(Locale.ROOT);
        double millis = switch (unit) {
            case "s" -> amount * 1_000;
            case "m" -> amount * 60_000;
            case "h" -> amount * 3_600_000;
            case "d" -> amount * 86_400_000;
            case "w" -> amount * 604_800_000;
            case "y" -> amount * 31_557_600_000L;
            default -> amount;
        };
        return Duration.ofMillis((long) millis);
    }
}

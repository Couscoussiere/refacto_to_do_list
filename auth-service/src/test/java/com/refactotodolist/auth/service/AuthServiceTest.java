package com.refactotodolist.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.security.KeyPair;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.jdbc.core.JdbcTemplate;

import com.refactotodolist.auth.TestKeys;
import com.refactotodolist.auth.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;

class AuthServiceTest {

    private static final KeyPair KEYS = TestKeys.generateKeyPair();

    private JdbcTemplate jdbc;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        jdbc = mock(JdbcTemplate.class);
        authService = new AuthService(jdbc, TestKeys.jwtKeys(KEYS), "1h");
    }

    // ─── normalizeEmail ──────────────────────────────────────────────────────

    @Test
    void normalizeEmail_minuscules() {
        assertThat(AuthService.normalizeEmail("OLIVIER@TEST.COM")).isEqualTo("olivier@test.com");
    }

    @Test
    void normalizeEmail_supprimeLesEspaces() {
        assertThat(AuthService.normalizeEmail("  olivier@test.com \t")).isEqualTo("olivier@test.com");
    }

    // ─── parseExpiresIn (format JWT_EXPIRES_IN) ─────────────────────────────

    @ParameterizedTest
    @CsvSource({
            "1h, 3600000",
            "30m, 1800000",
            "45s, 45000",
            "7d, 604800000",
            "1w, 604800000",
            "1.5h, 5400000",
            "500, 500",
            "250ms, 250",
            "2 H, 7200000",
    })
    void parseExpiresIn_formatsSupportes(String value, long expectedMillis) {
        assertThat(AuthService.parseExpiresIn(value)).isEqualTo(Duration.ofMillis(expectedMillis));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "abc", "1x", "-1h", "h1"})
    void parseExpiresIn_formatInvalide(String value) {
        assertThatThrownBy(() -> AuthService.parseExpiresIn(value))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageStartingWith("Invalid JWT_EXPIRES_IN");
    }

    // ─── signToken ───────────────────────────────────────────────────────────

    @Test
    void signToken_contientSubEmailRole_signeEnRs256() {
        String token = authService.signToken("42", "olivier@test.com", User.ROLE_ADMIN);

        Jws<Claims> jws = Jwts.parser().verifyWith(KEYS.getPublic()).build().parseSignedClaims(token);
        assertThat(jws.getHeader().getAlgorithm()).isEqualTo("RS256");
        assertThat(jws.getPayload().getSubject()).isEqualTo("42");
        assertThat(jws.getPayload().get("email", String.class)).isEqualTo("olivier@test.com");
        assertThat(jws.getPayload().get("role", String.class)).isEqualTo("admin");
    }

    @Test
    void signToken_expirationSelonJwtExpiresIn() {
        AuthService service = new AuthService(jdbc, TestKeys.jwtKeys(KEYS), "30m");

        Claims claims = Jwts.parser().verifyWith(KEYS.getPublic()).build()
                .parseSignedClaims(service.signToken("1", "a@b.com", User.ROLE_STANDARD))
                .getPayload();

        long lifetimeSeconds = (claims.getExpiration().getTime() - claims.getIssuedAt().getTime()) / 1000;
        assertThat(lifetimeSeconds).isEqualTo(1800);
    }

    @Test
    void signToken_nonVerifiableAvecUneAutreCle() {
        String token = authService.signToken("1", "a@b.com", User.ROLE_STANDARD);
        KeyPair other = TestKeys.generateKeyPair();

        assertThatThrownBy(() -> Jwts.parser().verifyWith(other.getPublic()).build().parseSignedClaims(token))
                .isInstanceOf(io.jsonwebtoken.security.SignatureException.class);
    }

    // ─── Accès base (JdbcTemplate mocké) ─────────────────────────────────────

    @Test
    void deleteUserById_ligneSupprimee_true() {
        when(jdbc.update(anyString(), anyLong())).thenReturn(1);

        assertThat(authService.deleteUserById(5)).isTrue();
        verify(jdbc).update("DELETE FROM users WHERE id = ?", 5L);
    }

    @Test
    void deleteUserById_aucuneLigne_false() {
        when(jdbc.update(anyString(), anyLong())).thenReturn(0);

        assertThat(authService.deleteUserById(99)).isFalse();
    }

    @Test
    void promoteToAdmin_metLeRoleAdmin() {
        authService.promoteToAdmin(7);

        verify(jdbc).update(eq("UPDATE users SET role = ? WHERE id = ?"), eq("admin"), eq(7L));
    }
}

package com.refactotodolist.auth.middleware;

import static org.assertj.core.api.Assertions.assertThat;

import java.security.KeyPair;
import java.time.Instant;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.refactotodolist.auth.TestKeys;
import com.refactotodolist.auth.model.AuthContext;

import io.jsonwebtoken.Jwts;

class RequireAuthInterceptorTest {

    private static final KeyPair KEYS = TestKeys.generateKeyPair();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private RequireAuthInterceptor interceptor;
    private MockHttpServletRequest req;
    private MockHttpServletResponse res;

    @BeforeEach
    void setUp() {
        interceptor = new RequireAuthInterceptor(TestKeys.jwtKeys(KEYS), objectMapper);
        req = new MockHttpServletRequest("GET", "/v1/auth/me");
        res = new MockHttpServletResponse();
    }

    private static String token(String sub, Instant expiration) {
        var builder = Jwts.builder().claim("email", "olivier@test.com").claim("role", "admin");
        if (sub != null) builder.subject(sub);
        if (expiration != null) builder.expiration(Date.from(expiration));
        return builder.signWith(KEYS.getPrivate(), Jwts.SIG.RS256).compact();
    }

    private String message() throws Exception {
        return objectMapper.readTree(res.getContentAsString()).get("message").asText();
    }

    @Test
    void tokenValide_laissePasser_etRenseigneLeContexte() throws Exception {
        req.addHeader("Authorization", "Bearer " + token("42", Instant.now().plusSeconds(60)));

        assertThat(interceptor.preHandle(req, res, new Object())).isTrue();

        AuthContext auth = (AuthContext) req.getAttribute(AuthContext.REQUEST_ATTRIBUTE);
        assertThat(auth).isEqualTo(new AuthContext("42", "olivier@test.com", "admin"));
    }

    @Test
    void preflightOptions_laissePasserSansToken() throws Exception {
        req.setMethod("OPTIONS");

        assertThat(interceptor.preHandle(req, res, new Object())).isTrue();
    }

    @Test
    void sansHeader_401() throws Exception {
        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(res.getStatus()).isEqualTo(401);
        assertThat(res.getContentType()).startsWith("application/json");
        assertThat(message()).isEqualTo("Missing Authorization header");
    }

    @Test
    void schemaNonBearer_401() throws Exception {
        req.addHeader("Authorization", "Basic abc");

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(message()).isEqualTo("Invalid Authorization header");
    }

    @Test
    void bearerSansToken_401() throws Exception {
        req.addHeader("Authorization", "Bearer");

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(message()).isEqualTo("Invalid Authorization header");
    }

    @Test
    void tokenMalforme_401() throws Exception {
        req.addHeader("Authorization", "Bearer pas.un.jwt");

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(res.getStatus()).isEqualTo(401);
        assertThat(message()).isEqualTo("Invalid token");
    }

    @Test
    void tokenExpire_401() throws Exception {
        req.addHeader("Authorization", "Bearer " + token("42", Instant.now().minusSeconds(60)));

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(message()).isEqualTo("Invalid token");
    }

    @Test
    void tokenSigneAvecUneAutreCle_401() throws Exception {
        String forged = Jwts.builder().subject("42")
                .signWith(TestKeys.generateKeyPair().getPrivate(), Jwts.SIG.RS256).compact();
        req.addHeader("Authorization", "Bearer " + forged);

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(message()).isEqualTo("Invalid token");
    }

    @Test
    void tokenSansSub_401() throws Exception {
        req.addHeader("Authorization", "Bearer " + token(null, null));

        assertThat(interceptor.preHandle(req, res, new Object())).isFalse();
        assertThat(message()).isEqualTo("Invalid token");
        assertThat(req.getAttribute(AuthContext.REQUEST_ATTRIBUTE)).isNull();
    }
}

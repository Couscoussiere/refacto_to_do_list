package com.refactotodolist.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.refactotodolist.auth.service.AdminAccountInitializer;

import io.jsonwebtoken.Jwts;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final KeyPair KEYS = generateKeyPair();

    private static final Map<String, String> USER = Map.of(
            "email", "olivier.dick@test.com",
            "password", "Password123",
            "firstName", "Olivier",
            "lastName", "Dick");

    @DynamicPropertySource
    static void jwtKeys(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.private-key", () -> toBase64Pem("PRIVATE KEY", KEYS.getPrivate().getEncoded()));
        registry.add("app.jwt.public-key", () -> toBase64Pem("PUBLIC KEY", KEYS.getPublic().getEncoded()));
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void cleanDb() {
        jdbc.update("DELETE FROM users");
    }

    @Test
    void health() throws Exception {
        mvc.perform(get("/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ok"));
    }

    @Nested
    class Register {

        @Test
        void donneesValides_201_userEtToken() throws Exception {
            postJson("/v1/auth/register", USER)
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.user.email").value("olivier.dick@test.com"))
                    .andExpect(jsonPath("$.user.firstName").value("Olivier"))
                    .andExpect(jsonPath("$.user.lastName").value("Dick"))
                    .andExpect(jsonPath("$.user.id").isNumber())
                    .andExpect(jsonPath("$.user.password").doesNotExist())
                    .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                    .andExpect(jsonPath("$.token").isString());
        }

        @Test
        void emailDejaUtilise_409() throws Exception {
            postJson("/v1/auth/register", USER);
            postJson("/v1/auth/register", USER)
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").value("Email already registered"));
        }

        @Test
        void champManquant_400() throws Exception {
            for (String field : USER.keySet()) {
                var body = new java.util.HashMap<>(USER);
                body.remove(field);
                postJson("/v1/auth/register", body).andExpect(status().isBadRequest());
            }
        }

        @Test
        void emailInvalide_400() throws Exception {
            var body = new java.util.HashMap<>(USER);
            body.put("email", "pas-un-email");
            postJson("/v1/auth/register", body)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Invalid email format"));
        }

        @Test
        void motDePasseFaible_400() throws Exception {
            var body = new java.util.HashMap<>(USER);
            body.put("password", "password");
            postJson("/v1/auth/register", body).andExpect(status().isBadRequest());
        }

        @Test
        void emailNormalise() throws Exception {
            var body = new java.util.HashMap<>(USER);
            body.put("email", "  Olivier.DICK@Test.com ");
            postJson("/v1/auth/register", body)
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.user.email").value("olivier.dick@test.com"));
        }

        @Test
        void formulaireUrlencoded_201() throws Exception {
            mvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                            .param("email", USER.get("email"))
                            .param("password", USER.get("password"))
                            .param("firstName", USER.get("firstName"))
                            .param("lastName", USER.get("lastName")))
                    .andExpect(status().isCreated());
        }

        @Test
        void jsonInvalide_400() throws Exception {
            mvc.perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("{oops"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Invalid JSON"));
        }
    }

    @Nested
    class Login {

        @BeforeEach
        void register() throws Exception {
            postJson("/v1/auth/register", USER);
        }

        @Test
        void identifiantsValides_200_tokenAvecSubEtEmail() throws Exception {
            String token = login();

            JsonNode payload = objectMapper.readTree(Base64.getUrlDecoder().decode(token.split("\\.")[1]));
            assertThat(payload.get("email").asText()).isEqualTo(USER.get("email"));
            assertThat(payload.get("sub").asText()).isNotBlank();
            assertThat(payload.get("exp").asLong() - payload.get("iat").asLong()).isEqualTo(3600);
        }

        @Test
        void mauvaisMotDePasse_401() throws Exception {
            postJson("/v1/auth/login", Map.of("email", USER.get("email"), "password", "WrongPass1"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid credentials"));
        }

        @Test
        void emailInexistant_401() throws Exception {
            postJson("/v1/auth/login", Map.of("email", "inconnu@test.com", "password", "Password123"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void champManquant_400() throws Exception {
            postJson("/v1/auth/login", Map.of("password", "Password123"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.received.keys[0]").value("password"));
            postJson("/v1/auth/login", Map.of("email", USER.get("email"))).andExpect(status().isBadRequest());
        }
    }

    @Nested
    class Me {

        private String token;

        @BeforeEach
        void registerAndLogin() throws Exception {
            postJson("/v1/auth/register", USER);
            token = login();
        }

        @Test
        void tokenValide_200() throws Exception {
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.email").value(USER.get("email")))
                    .andExpect(jsonPath("$.user.firstName").value(USER.get("firstName")))
                    .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
        }

        @Test
        void sansHeader_401() throws Exception {
            mvc.perform(get("/v1/auth/me"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Missing Authorization header"));
        }

        @Test
        void schemaNonBearer_401() throws Exception {
            mvc.perform(get("/v1/auth/me").header("Authorization", "Basic " + token))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid Authorization header"));
        }

        @Test
        void tokenExpire_401() throws Exception {
            String expired = Jwts.builder()
                    .subject("1")
                    .claim("email", USER.get("email"))
                    .expiration(Date.from(Instant.now().minusSeconds(3600)))
                    .signWith(KEYS.getPrivate(), Jwts.SIG.RS256)
                    .compact();
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + expired))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid token"));
        }

        @Test
        void tokenMalforme_401() throws Exception {
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer token-invalide"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid token"));
        }

        @Test
        void tokenSigneAvecUneAutreCle_401() throws Exception {
            String forged = Jwts.builder()
                    .subject("1")
                    .signWith(generateKeyPair().getPrivate(), Jwts.SIG.RS256)
                    .compact();
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + forged))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void tokenSansSub_401() throws Exception {
            String noSub = Jwts.builder()
                    .claim("email", USER.get("email"))
                    .signWith(KEYS.getPrivate(), Jwts.SIG.RS256)
                    .compact();
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + noSub))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid token"));
        }

        @Test
        void userInexistant_404() throws Exception {
            String ghost = Jwts.builder()
                    .subject("99999")
                    .claim("email", "fantome@test.com")
                    .signWith(KEYS.getPrivate(), Jwts.SIG.RS256)
                    .compact();
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + ghost))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value("User not found"))
                    .andExpect(jsonPath("$.user").doesNotExist());
        }
    }

    @Nested
    class DeleteMe {

        private String token;

        @BeforeEach
        void registerAndLogin() throws Exception {
            postJson("/v1/auth/register", USER);
            token = login();
        }

        @Test
        void compteStandard_204_etSupprimeEnBase() throws Exception {
            mvc.perform(delete("/v1/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isNoContent());
            assertThat(countUsers(USER.get("email"))).isZero();
        }

        @Test
        void compteAdmin_204() throws Exception {
            jdbc.update("UPDATE users SET role = 'admin' WHERE email = ?", USER.get("email"));
            mvc.perform(delete("/v1/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isNoContent());
        }

        @Test
        void apresSuppression_loginEchoue_401() throws Exception {
            mvc.perform(delete("/v1/auth/me").header("Authorization", "Bearer " + token));
            postJson("/v1/auth/login", Map.of("email", USER.get("email"), "password", USER.get("password")))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void sansToken_401() throws Exception {
            mvc.perform(delete("/v1/auth/me")).andExpect(status().isUnauthorized());
        }
    }

    @Nested
    class Admin {

        private static final Map<String, String> ADMIN = Map.of(
                "email", "admin@test.com", "password", "Password123", "firstName", "Ada", "lastName", "Admin");
        private static final Map<String, String> OTHER_ADMIN = Map.of(
                "email", "admin2@test.com", "password", "Password123", "firstName", "Bob", "lastName", "Admin");

        private String adminToken;
        private String standardToken;
        private long standardId;
        private long otherAdminId;

        @BeforeEach
        void setUp() throws Exception {
            postJson("/v1/auth/register", ADMIN);
            jdbc.update("UPDATE users SET role = 'admin' WHERE email = ?", ADMIN.get("email"));
            adminToken = login(ADMIN);

            postJson("/v1/auth/register", USER);
            standardToken = login(USER);
            standardId = userId(USER.get("email"));

            postJson("/v1/auth/register", OTHER_ADMIN);
            jdbc.update("UPDATE users SET role = 'admin' WHERE email = ?", OTHER_ADMIN.get("email"));
            otherAdminId = userId(OTHER_ADMIN.get("email"));
        }

        @Test
        void nouveauCompte_roleStandard() throws Exception {
            mvc.perform(get("/v1/auth/me").header("Authorization", "Bearer " + standardToken))
                    .andExpect(jsonPath("$.user.role").value("standard"));
        }

        @Test
        void tokenAdmin_contientLeRole() throws Exception {
            JsonNode payload = objectMapper.readTree(Base64.getUrlDecoder().decode(adminToken.split("\\.")[1]));
            assertThat(payload.get("role").asText()).isEqualTo("admin");
        }

        @Test
        void listeUsers_admin_200_sansPasswordHash() throws Exception {
            mvc.perform(get("/v1/auth/users").header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.users.length()").value(3))
                    .andExpect(jsonPath("$.users[0].passwordHash").doesNotExist());
        }

        @Test
        void listeUsers_standard_403() throws Exception {
            mvc.perform(get("/v1/auth/users").header("Authorization", "Bearer " + standardToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        void listeUsers_sansToken_401() throws Exception {
            mvc.perform(get("/v1/auth/users")).andExpect(status().isUnauthorized());
        }

        @Test
        void adminSupprimeStandard_204() throws Exception {
            mvc.perform(delete("/v1/auth/users/" + standardId).header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());
            assertThat(countUsers(USER.get("email"))).isZero();
        }

        @Test
        void adminNePeutPasSupprimerUnAdmin_403() throws Exception {
            mvc.perform(delete("/v1/auth/users/" + otherAdminId).header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isForbidden());
            assertThat(countUsers(OTHER_ADMIN.get("email"))).isOne();
        }

        @Test
        void standardNePeutPasSupprimer_403() throws Exception {
            mvc.perform(delete("/v1/auth/users/" + otherAdminId).header("Authorization", "Bearer " + standardToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        void userInexistant_404() throws Exception {
            mvc.perform(delete("/v1/auth/users/99999").header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }

        @Test
        void idInvalide_400() throws Exception {
            mvc.perform(delete("/v1/auth/users/abc").header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void roleVerifieEnBase_adminRetrograde_403() throws Exception {
            jdbc.update("UPDATE users SET role = 'standard' WHERE email = ?", ADMIN.get("email"));
            mvc.perform(delete("/v1/auth/users/" + standardId).header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class EnsureAdminAccount {

        @Autowired
        private AdminAccountInitializer initializer;

        @Test
        void creeLeCompteAdmin() {
            initializer.ensureAdminAccount(" Admin@Test.com ", "Password123");
            assertThat(roleOf("admin@test.com")).isEqualTo("admin");
        }

        @Test
        void promeutUnCompteExistant() throws Exception {
            postJson("/v1/auth/register", USER);
            initializer.ensureAdminAccount(USER.get("email"), "Password123");
            assertThat(roleOf(USER.get("email"))).isEqualTo("admin");
        }

        @Test
        void sansVariables_neFaitRien() {
            initializer.ensureAdminAccount("", "");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class)).isZero();
        }
    }

    private int countUsers(String email) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email);
    }

    private long userId(String email) {
        return jdbc.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, email);
    }

    private String roleOf(String email) {
        return jdbc.queryForObject("SELECT role FROM users WHERE email = ?", String.class, email);
    }

    private String login(Map<String, String> user) throws Exception {
        String response = postJson("/v1/auth/login",
                Map.of("email", user.get("email"), "password", user.get("password")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(response).get("token").asText();
    }

    private ResultActions postJson(String url, Object body) throws Exception {
        return mvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private String login() throws Exception {
        String response = postJson("/v1/auth/login",
                Map.of("email", USER.get("email"), "password", USER.get("password")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(response).get("token").asText();
    }

    private static KeyPair generateKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private static String toBase64Pem(String type, byte[] der) {
        String pem = "-----BEGIN " + type + "-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(der)
                + "\n-----END " + type + "-----\n";
        return Base64.getEncoder().encodeToString(pem.getBytes(StandardCharsets.UTF_8));
    }
}

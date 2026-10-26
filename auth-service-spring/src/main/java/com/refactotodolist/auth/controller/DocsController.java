package com.refactotodolist.auth.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Exposé seulement hors production (DOCS_ENABLED=false dans l'image Docker)
@RestController
@ConditionalOnProperty(name = "app.docs-enabled", havingValue = "true")
public class DocsController {

    private static final String SPEC_URL = "/v1/openapi.json";

    @GetMapping(path = SPEC_URL, produces = MediaType.APPLICATION_JSON_VALUE)
    public String openapi() throws IOException {
        return new ClassPathResource("openapi.json").getContentAsString(StandardCharsets.UTF_8);
    }

    @GetMapping(path = "/v1/docs", produces = MediaType.TEXT_HTML_VALUE)
    public String docs() {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Auth Service — API Docs</title>
                  <meta charset="utf-8"/>
                  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
                </head>
                <body>
                  <div id="swagger-ui"></div>
                  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
                  <script>
                    SwaggerUIBundle({ url: "%s", dom_id: "#swagger-ui", presets: [SwaggerUIBundle.presets.apis] });
                  </script>
                </body>
                </html>""".formatted(SPEC_URL);
    }
}

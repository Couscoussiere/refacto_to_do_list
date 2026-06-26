export const openapiSpec = {
	openapi: "3.0.3",
	info: { title: "Auth Service", version: "1.0.0" },
	servers: [{ url: "/v1/auth" }],
	paths: {
		"/register": {
			post: {
				summary: "Inscription",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "password", "firstName", "lastName"],
								properties: {
									email: { type: "string", format: "email" },
									password: { type: "string", minLength: 8 },
									firstName: { type: "string" },
									lastName: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Utilisateur créé" },
					"400": { description: "Données invalides" },
					"409": { description: "Email déjà utilisé" },
				},
			},
		},
		"/login": {
			post: {
				summary: "Connexion",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "password"],
								properties: {
									email: { type: "string", format: "email" },
									password: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Token JWT retourné" },
					"401": { description: "Identifiants incorrects" },
				},
			},
		},
		"/me": {
			get: {
				summary: "Profil utilisateur connecté",
				security: [{ bearerAuth: [] }],
				responses: {
					"200": { description: "Profil utilisateur" },
					"401": { description: "Token manquant ou invalide" },
				},
			},
		},
	},
	components: {
		securitySchemes: {
			bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
		},
	},
};

export const swaggerHtml = (specUrl: string) => `<!DOCTYPE html>
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
    SwaggerUIBundle({ url: "${specUrl}", dom_id: "#swagger-ui", presets: [SwaggerUIBundle.presets.apis] });
  </script>
</body>
</html>`;

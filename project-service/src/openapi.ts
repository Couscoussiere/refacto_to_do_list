export const openapiSpec = {
	openapi: "3.0.3",
	info: { title: "Project Service", version: "1.0.0" },
	servers: [{ url: "/v1/projects" }],
	paths: {
		"/": {
			get: {
				summary: "Liste tous les projets",
				security: [{ bearerAuth: [] }],
				responses: { "200": { description: "Liste des projets" } },
			},
		},
		"/create": {
			post: {
				summary: "Créer un projet",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["name", "startDate", "dueDate"],
								properties: {
									name: { type: "string" },
									startDate: { type: "string", format: "date" },
									dueDate: { type: "string", format: "date" },
									description: { type: "string" },
									budget: { type: "number" },
									status: { type: "string", enum: ["NOT_STARTED", "IN_PROGRESS", "DONE"] },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Projet créé" },
					"400": { description: "Données invalides" },
					"409": { description: "Nom déjà utilisé" },
				},
			},
		},
		"/{id}": {
			get: {
				summary: "Récupérer un projet",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: {
					"200": { description: "Projet trouvé" },
					"404": { description: "Projet introuvable" },
				},
			},
			put: {
				summary: "Modifier un projet",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: { "200": { description: "Projet mis à jour" } },
			},
			delete: {
				summary: "Supprimer un projet",
				security: [{ bearerAuth: [] }],
				parameters: [
					{ name: "id", in: "path", required: true, schema: { type: "integer" } },
					{ name: "force", in: "query", schema: { type: "boolean" } },
				],
				responses: { "204": { description: "Projet supprimé" } },
			},
		},
		"/{id}/tasks": {
			get: {
				summary: "Tâches d'un projet",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: { "200": { description: "Liste des tâches" } },
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
  <title>Project Service — API Docs</title>
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

export const openapiSpec = {
	openapi: "3.0.3",
	info: { title: "Task Service", version: "1.0.0" },
	servers: [{ url: "/v1/tasks" }],
	paths: {
		"/": {
			get: {
				summary: "Liste toutes les tâches",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "projectId", in: "query", schema: { type: "integer" } }],
				responses: { "200": { description: "Liste des tâches" } },
			},
			post: {
				summary: "Créer une tâche",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["projectId", "userId", "name"],
								properties: {
									projectId: { type: "integer" },
									userId: { type: "integer" },
									name: { type: "string" },
									description: { type: "string" },
									priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
									status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] },
									dueDate: { type: "string", format: "date" },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Tâche créée" },
					"400": { description: "Données invalides" },
				},
			},
		},
		"/{id}": {
			get: {
				summary: "Récupérer une tâche",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: {
					"200": { description: "Tâche trouvée" },
					"404": { description: "Tâche introuvable" },
				},
			},
			put: {
				summary: "Modifier une tâche",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: { "200": { description: "Tâche mise à jour" } },
			},
			delete: {
				summary: "Supprimer une tâche",
				security: [{ bearerAuth: [] }],
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: { "204": { description: "Tâche supprimée" } },
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
  <title>Task Service — API Docs</title>
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

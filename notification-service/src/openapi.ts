export const openapiSpec = {
	openapi: "3.0.3",
	info: { title: "Notification Service", version: "1.0.0" },
	servers: [{ url: "/" }],
	paths: {
		"/health": {
			get: {
				summary: "Health check",
				responses: { "200": { description: "Service opérationnel" } },
			},
		},
		"/v1/notifications/ws": {
			get: {
				summary: "WebSocket — flux de notifications en temps réel",
				description: "Connexion WebSocket. Événements : project.completed, task.created, task.completed, task.cancelled, task.reopened, task.started, task.deleted",
				responses: { "101": { description: "Switching Protocols (WebSocket)" } },
			},
		},
	},
};

export const swaggerHtml = (specUrl: string) => `<!DOCTYPE html>
<html>
<head>
  <title>Notification Service — API Docs</title>
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

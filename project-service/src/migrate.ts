import mysql from "mysql2/promise";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "projectdb",
    multipleStatements: false,
  });

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (version)
      )
    `);

    const migrationsDir = path.join(__dirname, "../sql/migrations");
    const files = (await fs.readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT version FROM schema_migrations WHERE version = ?",
        [file]
      );
      if (rows.length > 0) continue;

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        await conn.execute(stmt);
      }

      await conn.execute(
        "INSERT INTO schema_migrations (version) VALUES (?)",
        [file]
      );
      console.log(`[migrate] Applied: ${file}`);
    }
  } finally {
    await conn.end();
  }
}

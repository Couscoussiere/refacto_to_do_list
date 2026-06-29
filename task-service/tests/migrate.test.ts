import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyMigrations, type MigrationConn } from "../src/migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures/migrations");

const createSQLiteConn = (db: Database.Database): MigrationConn => ({
  execute: async (sql: string, params: unknown[] = []) => {
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }, []];
  },
  query: async <T>(sql: string, params: unknown[] = []) => {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    return [rows as T, []];
  },
  end: async () => {},
});

describe("applyMigrations", () => {
  let db: Database.Database;
  let conn: MigrationConn;

  beforeEach(() => {
    db = new Database(":memory:");
    conn = createSQLiteConn(db);
  });

  it("crée la table schema_migrations si elle n'existe pas", async () => {
    await applyMigrations(conn, FIXTURES_DIR);
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'")
      .get();
    expect(table).toBeDefined();
  });

  it("applique les migrations dans l'ordre alphabétique", async () => {
    await applyMigrations(conn, FIXTURES_DIR);
    const rows = db
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all() as { version: string }[];
    expect(rows.map((r) => r.version)).toEqual(["V001__test_table_a.sql", "V002__test_table_b.sql"]);
  });

  it("enregistre chaque version appliquée dans schema_migrations", async () => {
    await applyMigrations(conn, FIXTURES_DIR);
    const row = db
      .prepare("SELECT version FROM schema_migrations WHERE version = 'V001__test_table_a.sql'")
      .get();
    expect(row).toBeDefined();
  });

  it("est idempotent — un second appel ne réapplique pas les migrations", async () => {
    await applyMigrations(conn, FIXTURES_DIR);
    await applyMigrations(conn, FIXTURES_DIR);
    const rows = db.prepare("SELECT version FROM schema_migrations").all();
    expect(rows).toHaveLength(2);
  });

  it("crée effectivement les tables définies dans les fichiers SQL", async () => {
    await applyMigrations(conn, FIXTURES_DIR);
    const tableA = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table_a'")
      .get();
    const tableB = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table_b'")
      .get();
    expect(tableA).toBeDefined();
    expect(tableB).toBeDefined();
  });
});

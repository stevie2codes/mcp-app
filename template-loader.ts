import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TemplateSchema, type Template } from "./src/types/template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = __filename.endsWith(".ts")
  ? path.join(__dirname, "templates")
  : path.join(__dirname, "..", "templates");

export async function loadTemplate(id: string): Promise<Template | null> {
  try {
    const filePath = path.join(TEMPLATES_DIR, `${id}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return TemplateSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function listTemplates(): Promise<{ id: string; name: string }[]> {
  try {
    const files = await fs.readdir(TEMPLATES_DIR);
    const templates: { id: string; name: string }[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(TEMPLATES_DIR, file), "utf-8");
        const parsed = TemplateSchema.parse(JSON.parse(raw));
        templates.push({ id: parsed.id, name: parsed.name });
      } catch {
        // Skip invalid template files
      }
    }
    return templates;
  } catch {
    return [];
  }
}

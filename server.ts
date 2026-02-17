import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  listTemplates,
  loadAllTemplates,
  loadTemplate,
} from "./template-loader.js";
import type { Template } from "./src/types/template.js";

// Works both from source (server.ts) and compiled (dist/server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = __filename.endsWith(".ts")
  ? path.join(__dirname, "dist")
  : __dirname;

interface SocrataColumn {
  field: string;
  headerName: string;
}

/**
 * Fetches data from the Socrata SODA API.
 */
async function fetchSocrataData(
  domain: string,
  datasetId: string,
  query?: string,
  limit?: number,
): Promise<Record<string, unknown>[]> {
  const appToken = process.env.SOCRATA_APP_TOKEN;
  const url = new URL(`https://${domain}/resource/${datasetId}.json`);

  if (query) {
    // Socrata requires LIMIT inside $query — separate $limit param is not allowed alongside $query
    const hasLimit = /\bLIMIT\b/i.test(query);
    const fullQuery = hasLimit ? query : `${query} LIMIT ${limit ?? 1000}`;
    url.searchParams.set("$query", fullQuery);
  } else if (limit) {
    url.searchParams.set("$limit", String(limit));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (appToken) {
    headers["X-App-Token"] = appToken;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Socrata API error (${response.status}): ${errorText}`,
    );
  }

  return response.json() as Promise<Record<string, unknown>[]>;
}

/**
 * Derives AG Grid column definitions from the first row of data.
 */
function deriveColumns(
  data: Record<string, unknown>[],
  requestedColumns?: string[],
): SocrataColumn[] {
  if (data.length === 0) return [];

  const allKeys = Object.keys(data[0]);
  const keys = requestedColumns
    ? requestedColumns.filter((c) => allKeys.includes(c))
    : allKeys;

  return keys.map((key) => ({
    field: key,
    headerName: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}

/**
 * Creates a new MCP server instance with the generate_report tool.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Socrata Report Builder",
    version: "1.0.0",
  });

  const resourceUri = "ui://generate-report/report-app.html";

  registerAppTool(
    server,
    "generate_report",
    {
      title: "Generate Report",
      description:
        "Queries a Socrata open data dataset and renders an interactive report with sorting, filtering, and export capabilities. Provide the Socrata domain, dataset ID, and optionally a SoQL query.",
      inputSchema: {
        domain: z
          .string()
          .describe(
            'The Socrata domain to query, e.g. "data.cityofchicago.org"',
          ),
        datasetId: z
          .string()
          .describe('The dataset identifier, e.g. "ijzp-q8t2"'),
        title: z.string().describe("The report title/heading"),
        query: z
          .string()
          .optional()
          .describe(
            'Optional SoQL query, e.g. "SELECT * WHERE year = 2024"',
          ),
        columns: z
          .array(z.string())
          .optional()
          .describe("Optional subset of column names to display"),
        limit: z
          .number()
          .optional()
          .default(1000)
          .describe("Maximum number of rows to fetch (default: 1000)"),
        templateId: z
          .string()
          .optional()
          .describe(
            'Optional template ID for branded report header, e.g. "federal-standard". Use list_templates to see available options.',
          ),
        templateOverrides: z
          .object({
            agencyName: z.string().optional(),
            logoUrl: z.string().optional(),
            subtitle: z.string().optional(),
            showDate: z.boolean().optional(),
            showReportPeriod: z.boolean().optional(),
            primaryColor: z.string().optional(),
            accentColor: z.string().optional(),
          })
          .optional()
          .describe(
            "Optional overrides for the template header. Applied on top of the base template if templateId is provided, or used standalone.",
          ),
      },
      _meta: { ui: { resourceUri } },
    },
    async (args: {
      domain: string;
      datasetId: string;
      title: string;
      query?: string;
      columns?: string[];
      limit?: number;
      templateId?: string;
      templateOverrides?: {
        agencyName?: string;
        logoUrl?: string;
        subtitle?: string;
        showDate?: boolean;
        showReportPeriod?: boolean;
        primaryColor?: string;
        accentColor?: string;
      };
    }): Promise<CallToolResult> => {
      const {
        domain,
        datasetId,
        title,
        query,
        columns,
        limit = 1000,
        templateId,
        templateOverrides,
      } = args;

      // Resolve template
      let resolvedTemplate: Template | undefined;
      if (templateId) {
        const loaded = await loadTemplate(templateId);
        if (!loaded) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Template "${templateId}" not found. Use list_templates to see available templates.`,
              },
            ],
            isError: true,
          };
        }
        resolvedTemplate = loaded;
      }

      // Apply overrides
      if (templateOverrides && resolvedTemplate) {
        resolvedTemplate = {
          ...resolvedTemplate,
          header: {
            ...resolvedTemplate.header,
            ...(templateOverrides.agencyName !== undefined && {
              agencyName: templateOverrides.agencyName,
            }),
            ...(templateOverrides.logoUrl !== undefined && {
              logoUrl: templateOverrides.logoUrl,
            }),
            ...(templateOverrides.subtitle !== undefined && {
              subtitle: templateOverrides.subtitle,
            }),
            ...(templateOverrides.showDate !== undefined && {
              showDate: templateOverrides.showDate,
            }),
            ...(templateOverrides.showReportPeriod !== undefined && {
              showReportPeriod: templateOverrides.showReportPeriod,
            }),
          },
          style: {
            ...resolvedTemplate.style,
            ...(templateOverrides.primaryColor !== undefined && {
              primaryColor: templateOverrides.primaryColor,
            }),
            ...(templateOverrides.accentColor !== undefined && {
              accentColor: templateOverrides.accentColor,
            }),
          },
        };
      } else if (templateOverrides && !resolvedTemplate) {
        resolvedTemplate = {
          id: "custom",
          name: "Custom",
          header: {
            agencyName: templateOverrides.agencyName ?? "",
            logoUrl: templateOverrides.logoUrl,
            subtitle: templateOverrides.subtitle,
            showDate: templateOverrides.showDate ?? true,
            showReportPeriod: templateOverrides.showReportPeriod ?? false,
          },
          style: {
            primaryColor: templateOverrides.primaryColor,
            accentColor: templateOverrides.accentColor,
          },
        };
      }

      try {
        const data = await fetchSocrataData(domain, datasetId, query, limit);
        const derivedColumns = deriveColumns(data, columns);

        const result = {
          title,
          domain,
          datasetId,
          columns: derivedColumns,
          data,
          totalRows: data.length,
          query: query ?? `SELECT * LIMIT ${limit}`,
          ...(resolvedTemplate && { template: resolvedTemplate }),
          ...(!resolvedTemplate && {
            availableTemplates: await loadAllTemplates(),
          }),
        };

        return {
          content: [
            {
              type: "text",
              text: `Report "${title}" generated with ${data.length} rows from ${domain}/${datasetId}`,
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "report-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  server.registerTool(
    "list_templates",
    {
      title: "List Report Templates",
      description:
        "Lists available report templates. Returns template IDs and names that can be passed to generate_report's templateId parameter.",
    },
    async (): Promise<CallToolResult> => {
      const templates = await listTemplates();
      if (templates.length === 0) {
        return {
          content: [{ type: "text", text: "No templates found." }],
        };
      }
      const lines = templates
        .map((t) => `- **${t.name}** (id: \`${t.id}\`)`)
        .join("\n");
      return {
        content: [
          {
            type: "text",
            text: `Available report templates:\n\n${lines}`,
          },
        ],
      };
    },
  );

  return server;
}

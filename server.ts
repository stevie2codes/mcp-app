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
    }): Promise<CallToolResult> => {
      const { domain, datasetId, title, query, columns, limit = 1000 } = args;

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

  return server;
}

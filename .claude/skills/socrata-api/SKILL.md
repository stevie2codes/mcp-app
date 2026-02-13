---
name: socrata-api
description: Use when building SoQL queries, selecting Socrata domains/datasets, debugging API errors, or working on the generate_report tool. Provides SODA API patterns, common domains, and dataset discovery tips.
---

# Socrata SODA API Reference

## API Basics

**Endpoint pattern:** `GET https://{domain}/resource/{datasetId}.json`

**Dataset IDs** are 8 alphanumeric characters split by a dash (e.g. `ijzp-q8t2`).

**Authentication:** Public datasets require no auth. Optional `X-App-Token` header for higher rate limits (1K -> 10K req/hr). Token set via `SOCRATA_APP_TOKEN` env var.

**Response:** JSON array of row objects. Field names are lowercase/underscored versions of column names.

## Query Parameters

| Param | Description | Example |
|-------|-------------|---------|
| `$query` | Full SoQL query | `SELECT * WHERE year = 2024 LIMIT 100` |
| `$limit` | Max rows returned | `1000` (default varies by domain) |
| `$offset` | Skip N rows | `1000` (for pagination) |
| `$where` | Filter clause | `magnitude > 3.0` |
| `$select` | Column selection | `date, type, description` |
| `$order` | Sort order | `date DESC` |
| `$group` | Group by columns | `type` |
| `$q` | Full-text search | `robbery` |

**Prefer `$query`** over individual params — it's the most flexible and what our `generate_report` tool uses.

## SoQL Quick Reference

SoQL is SQL-like. Key differences from SQL:
- Column names with spaces/special chars use backticks: `` `column name` ``
- No `FROM` clause (query runs against a specific dataset endpoint)
- Use `$query` param to pass the full query string

For detailed SoQL syntax and all available functions, see [soql-reference.md](soql-reference.md).

### Common Query Patterns

```sql
-- Filter by year
SELECT * WHERE date_extract_y(date_column) = 2024

-- Aggregate counts by category
SELECT type, count(*) AS total GROUP BY type ORDER BY total DESC

-- Full-text search + filter
SELECT * WHERE $q = 'robbery' AND year = 2024

-- Date range
SELECT * WHERE date BETWEEN '2024-01-01' AND '2024-12-31'

-- Top N results
SELECT * ORDER BY amount DESC LIMIT 50
```

## Common Domains & Datasets

| Domain | City/Org | Popular Datasets |
|--------|----------|------------------|
| `data.cityofchicago.org` | Chicago | `ijzp-q8t2` (crimes), `ydr8-5enu` (building permits), `97z8-de96` (food inspections) |
| `data.ny.gov` | New York State | Various health, education, transportation datasets |
| `data.cityofnewyork.us` | NYC | `erm2-nwe9` (311 complaints), `h9gi-nx95` (motor vehicle collisions) |
| `data.sfgov.org` | San Francisco | `wg3w-h783` (police incidents), `i98e-djp9` (building permits) |
| `data.lacity.org` | Los Angeles | Crime, building, business datasets |
| `data.illinois.gov` | Illinois | State-level government datasets |
| `data.wa.gov` | Washington | State-level government datasets |

### Discovering Datasets

Users describe data in natural language. To find the right dataset:

1. **Identify the domain** from the city/state mentioned (see table above)
2. **Browse the catalog** at `https://{domain}` — the homepage lists categories
3. **Search the API catalog:** `GET https://api.us.socrata.com/api/catalog/v1?q=crime&domains={domain}`
4. **Get dataset metadata:** `GET https://{domain}/api/views/{datasetId}.json` returns column names, types, description
5. **Preview data:** `GET https://{domain}/resource/{datasetId}.json?$limit=5` to check structure

## Error Handling

| Status | Cause | Fix |
|--------|-------|-----|
| 400 | Bad SoQL query | Check column names, syntax |
| 403 | Rate limited or private dataset | Add app token, verify dataset is public |
| 404 | Wrong domain or dataset ID | Verify both exist |
| 500 | Server error | Retry, simplify query |

**Common SoQL mistakes:**
- Using SQL column names instead of Socrata field names (underscored, lowercase)
- Forgetting quotes around string values in WHERE clauses
- Using `date_column = '2024'` instead of `date_extract_y(date_column) = 2024` for year filtering

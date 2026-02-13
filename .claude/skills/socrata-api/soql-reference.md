# SoQL Reference

Detailed syntax for all SoQL clauses and functions.

## Clauses

### SELECT
```sql
SELECT *                                    -- all columns
SELECT column1, column2                     -- specific columns
SELECT column1 AS alias1                    -- aliased
SELECT count(*) AS total                    -- aggregated
SELECT `column with spaces`                 -- backtick-quoted
```

### WHERE
```sql
WHERE year = 2024
WHERE magnitude > 3.0 AND source = 'pr'
WHERE status IS NOT NULL
WHERE type IN ('theft', 'robbery', 'assault')
WHERE amount BETWEEN 100 AND 500
WHERE description LIKE '%fire%'
WHERE starts_with(address, '100 N')
```

Operators: `=`, `!=`, `<`, `>`, `<=`, `>=`, `AND`, `OR`, `NOT`, `IS NULL`, `IS NOT NULL`, `IN`, `NOT IN`, `BETWEEN`, `LIKE`, `NOT LIKE`

### ORDER BY
```sql
ORDER BY date DESC
ORDER BY category ASC, amount DESC
```

### GROUP BY / HAVING
```sql
SELECT type, count(*) AS cnt GROUP BY type
SELECT type, count(*) AS cnt GROUP BY type HAVING cnt > 100
SELECT source, avg(magnitude) AS avg_mag GROUP BY source ORDER BY avg_mag DESC
```

### LIMIT / OFFSET
```sql
LIMIT 1000
LIMIT 100 OFFSET 200
```

### Full-Text Search
```sql
WHERE $q = 'search term'
```
Searches across all text columns. Combine with WHERE for filtered search.

## Functions

### Aggregate
| Function | Description |
|----------|-------------|
| `count(*)` | Total records |
| `count(col)` | Non-null count |
| `sum(col)` | Sum of values |
| `avg(col)` | Mean value |
| `min(col)` | Minimum value |
| `max(col)` | Maximum value |
| `stddev_pop(col)` | Population standard deviation |
| `stddev_samp(col)` | Sample standard deviation |

### Date/Time
| Function | Returns |
|----------|---------|
| `date_extract_y(col)` | Year (integer) |
| `date_extract_m(col)` | Month (1-12) |
| `date_extract_d(col)` | Day (1-31) |
| `date_extract_hh(col)` | Hour (0-23) |
| `date_extract_mm(col)` | Minute (0-59) |
| `date_extract_ss(col)` | Second (0-59) |
| `date_extract_dow(col)` | Day of week (0=Sun, 6=Sat) |
| `date_extract_woy(col)` | Week of year (0-51) |
| `date_trunc_y(col)` | Truncate to year |
| `date_trunc_ym(col)` | Truncate to year+month |
| `date_trunc_ymd(col)` | Truncate to year+month+day |

### String
| Function | Description |
|----------|-------------|
| `upper(col)` | Uppercase |
| `lower(col)` | Lowercase |
| `starts_with(col, 'prefix')` | Starts with substring |
| `like 'pattern'` | Pattern match (% wildcard) |
| `not like 'pattern'` | Negative pattern match |
| `unaccent(col)` | Remove diacritical marks |

### Math
| Function | Description |
|----------|-------------|
| `greatest(a, b, ...)` | Maximum of arguments |
| `least(a, b, ...)` | Minimum of arguments |
| `ln(col)` | Natural logarithm |

### Geospatial
| Function | Description |
|----------|-------------|
| `distance_in_meters(point1, point2)` | Distance between points |
| `within_box(col, nwLat, nwLon, seLat, seLon)` | Within bounding box |
| `within_circle(col, lat, lon, radius_meters)` | Within radius |
| `within_polygon(col, 'MULTIPOLYGON(...)')` | Within polygon |
| `intersects(col, 'POINT(...)')` | Geometry intersection |
| `convex_hull(col)` | Minimum enclosing geometry |
| `extent(col)` | Bounding box of geometry set |
| `num_points(col)` | Vertex count |
| `simplify(col, tolerance)` | Reduce vertices |

### Conditional
```sql
CASE(condition1, value1, condition2, value2, default_value)
```

## Data Types

| Type | Notes |
|------|-------|
| Text | String values, quoted in queries |
| Number | Integer or decimal |
| Checkbox | Boolean (`true`/`false`) |
| Fixed Timestamp | Absolute time with timezone |
| Floating Timestamp | Date/time without timezone (e.g. `2024-01-15T00:00:00`) |
| Point | `POINT (longitude latitude)` |
| Location | Legacy type with latitude, longitude, address |
| Line, MultiLine | GeoJSON line geometries |
| Polygon, MultiPolygon | GeoJSON polygon geometries |
| URL | Link with URL and description |

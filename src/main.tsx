import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ClientSideRowModelModule,
  CsvExportModule,
  QuickFilterModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  ModuleRegistry,
} from "ag-grid-community";
import {
  defineButtonComponent,
  defineTextFieldComponent,
  defineToolbarComponent,
  defineLinearProgressComponent,
  defineIconComponent,
  defineIconButtonComponent,
  defineDividerComponent,
  defineBadgeComponent,
  defineTooltipComponent,
  defineInlineMessageComponent,
  defineSkeletonComponent,
  IconRegistry,
} from "@tylertech/forge";

// Forge styles (tokens + theme + all component CSS)
import "@tylertech/forge/dist/forge.css";

// Theme bridge: maps MCP host variables to Forge tokens
import "./lib/forge-theme-bridge.css";

// App styles
import "./global.css";
import "./report-app.css";

import { App } from "./App";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
  QuickFilterModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
]);

// Register Forge web components
defineButtonComponent();
defineTextFieldComponent();
defineToolbarComponent();
defineLinearProgressComponent();
defineIconComponent();
defineIconButtonComponent();
defineDividerComponent();
defineBadgeComponent();
defineTooltipComponent();
defineInlineMessageComponent();
defineSkeletonComponent();

// Register inline SVG icons (no CDN needed — works in sandboxed iframe)
IconRegistry.define([
  {
    name: "search",
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  },
  {
    name: "download",
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  },
  {
    name: "error_outline",
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
  },
  {
    name: "code",
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  },
]);

// Mount React
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

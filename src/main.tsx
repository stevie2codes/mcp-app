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

// Mount React
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

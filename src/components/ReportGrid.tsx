import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

import type { ReportColumn } from "../hooks/useReportData";

interface ReportGridProps {
  columns: ReportColumn[];
  rowData: Record<string, unknown>[];
  quickFilterText: string;
  onGridReady: (api: GridApi) => void;
}

export function ReportGrid({
  columns,
  rowData,
  quickFilterText,
  onGridReady,
}: ReportGridProps) {
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs: ColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col.field,
        headerName: col.headerName,
        filter: true,
        sortable: true,
        resizable: true,
        flex: 1,
        minWidth: 120,
      })),
    [columns],
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
    }),
    [],
  );

  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      onGridReady(event.api);
    },
    [onGridReady],
  );

  return (
    <div className="ag-theme-balham">
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={50}
        paginationPageSizeSelector={[25, 50, 100, 200]}
        domLayout="autoHeight"
        quickFilterText={quickFilterText}
        onGridReady={handleGridReady}
        animateRows={true}
      />
    </div>
  );
}

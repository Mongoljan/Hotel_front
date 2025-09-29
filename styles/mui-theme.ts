"use client";

import { useMemo } from "react";
import { createTheme, Theme } from "@mui/material/styles";
import "@mui/x-data-grid/themeAugmentation";

const BASE_FONT_STACK = [
  "var(--font-inter)",
  "Inter",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "\"Segoe UI\"",
  "Roboto",
  "\"Helvetica Neue\"",
  "Arial",
  "sans-serif",
].join(",");

export function useHotelMuiTheme(): Theme {
  return useMemo(
    () =>
      createTheme({
        cssVariables: true,
        palette: {
          mode: "light",
          primary: {
            main: "#6366f1",
            light: "#818cf8",
            dark: "#4f46e5",
          },
          secondary: {
            main: "#0ea5e9",
          },
          success: {
            main: "#22c55e",
          },
          warning: {
            main: "#f59e0b",
          },
          error: {
            main: "#ef4444",
          },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
          text: {
            primary: "#0f172a",
            secondary: "#475569",
          },
        },
        typography: {
          fontFamily: BASE_FONT_STACK,
          fontSize: 14,
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 14,
        },
        components: {
          MuiDataGrid: {
            defaultProps: {
              rowHeight: 68,
              columnHeaderHeight: 56,
              disableColumnMenu: true,
              disableRowSelectionOnClick: true,
              disableDensitySelector: true,
              disableColumnSelector: true,
            },
            styleOverrides: {
              root: {
                borderRadius: 18,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(12px)",
              },
              columnHeaders: {
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(14, 165, 233, 0.08))",
                backdropFilter: "blur(6px)",
              },
              cell: {
                borderColor: "rgba(148, 163, 184, 0.2)",
                padding: "0 12px",
              },
              row: {
                transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
                '&.Mui-selected': {
                  backgroundColor: "rgba(99, 102, 241, 0.08) !important",
                },
                '&:hover': {
                  backgroundColor: "rgba(99, 102, 241, 0.06)",
                },
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 12,
                backgroundColor: "rgba(15, 23, 42, 0.88)",
              },
            },
          },
        },
      }),
    []
  );
}

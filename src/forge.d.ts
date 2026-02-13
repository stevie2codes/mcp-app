/**
 * TypeScript declarations for Tyler Forge custom elements used in React JSX.
 * React 19 supports custom elements natively, but we need type declarations
 * so TSX knows about the element attributes.
 */

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "forge-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: "text" | "outlined" | "tonal" | "filled" | "raised" | "link";
          pill?: boolean;
          dense?: boolean;
          disabled?: boolean;
          type?: string;
          "full-width"?: boolean;
        },
        HTMLElement
      >;
      "forge-text-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "show-clear"?: boolean;
          variant?: string;
          density?: string;
          shape?: string;
          dense?: boolean;
        },
        HTMLElement
      >;
      "forge-toolbar": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "forge-linear-progress": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          indeterminate?: boolean;
          progress?: number;
          buffer?: number;
        },
        HTMLElement
      >;
      "forge-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name?: string;
        },
        HTMLElement
      >;
      "forge-skeleton": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

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
          external?: boolean;
          src?: string;
        },
        HTMLElement
      >;
      "forge-icon-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: "icon" | "outlined" | "tonal" | "filled" | "raised";
          density?: "small" | "medium" | "large";
          shape?: "circular" | "squared";
          toggle?: boolean;
          pressed?: boolean;
        },
        HTMLElement
      >;
      "forge-skeleton": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          text?: boolean;
          avatar?: boolean;
          button?: boolean;
          chip?: boolean;
          stretch?: boolean;
          "form-field"?: boolean;
          "list-item"?: boolean;
        },
        HTMLElement
      >;
      "forge-divider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          vertical?: boolean;
        },
        HTMLElement
      >;
      "forge-badge": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          theme?:
            | "primary"
            | "secondary"
            | "tertiary"
            | "success"
            | "warning"
            | "error"
            | "info"
            | "info-primary"
            | "info-secondary"
            | "danger"
            | "default";
          dot?: boolean;
          strong?: boolean;
        },
        HTMLElement
      >;
      "forge-tooltip": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          anchor?: string;
          placement?: string;
          delay?: number;
          type?: "presentation" | "label" | "description";
        },
        HTMLElement
      >;
      "forge-inline-message": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          theme?:
            | "primary"
            | "secondary"
            | "tertiary"
            | "success"
            | "warning"
            | "error"
            | "info"
            | "info-secondary"
            | "danger";
        },
        HTMLElement
      >;
    }
  }
}

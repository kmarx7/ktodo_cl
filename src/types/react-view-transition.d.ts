import "react";

declare module "react" {
  interface ViewTransitionProps {
    children?: React.ReactNode;
    name?: string;
    default?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    share?: string;
    update?: string;
  }
  export const ViewTransition: React.FC<ViewTransitionProps>;
}

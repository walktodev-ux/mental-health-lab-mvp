declare module "@citation-js/core" {
  export class Cite {
    constructor(data: unknown);

    format(
      type: string,
      options?: {
        format?: string;
        template?: string;
        lang?: string;
        [key: string]: unknown;
      },
    ): string;
  }

  export const plugins: {
    config: {
      get(name: string): {
        templates: {
          add(name: string, style: string): void;
        };
      };
    };
  };
}

declare module "@citation-js/plugin-csl";
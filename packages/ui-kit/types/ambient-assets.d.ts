/**
 * Tracked ambient modules for non-TS imports. Under `src/`, `*.d.ts` is gitignored
 * (generated sidecars); CI checkouts need these declarations committed outside `src/`.
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.otf' {
  const src: string;
  export default src;
}

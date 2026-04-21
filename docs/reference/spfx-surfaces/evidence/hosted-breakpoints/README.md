# Homepage hosted breakpoint captures

Hosted SharePoint screenshot evidence for the flagship hero + entry-stack sign-off across the canonical seven-breakpoint matrix.

Filename convention: `{index}-{viewport}-dpr{n}.png`, zero-padded index.

Expected files (7 total):

- `01-2560x1440-dpr1.png`
- `02-1920x1080-dpr1.png`
- `03-1512x982-dpr2.png`
- `04-1366x768-dpr1.png`
- `05-834x1210-dpr2.png`
- `06-440x956-dpr3.png`
- `07-402x872-dpr3.png`

Method, DOM marker expectations, and closure rules live in [`../../homepage-hosted-breakpoint-evidence.md`](../../homepage-hosted-breakpoint-evidence.md).

Screenshots must come from real SharePoint hosting (not local workbench preview), at exact viewport × DPR via DevTools device emulation, with all required DOM markers confirmed before capture.

# Design QA

## Findings

- P0: none
- P1: none
- P2: none
- P3: the Next.js development indicator appears in local screenshots. It is not application UI and is absent from the production build.

## Source and implementation

- Lab source visual: `/var/folders/gh/h0w35ykj38g704395y8_wz400000gn/T/TemporaryItems/NSIRD_screencaptureui_bJsNvF/Screenshot 2026-08-03 at 10.37.01 AM.png`
- Basis annotation source: `/var/folders/gh/h0w35ykj38g704395y8_wz400000gn/T/TemporaryItems/NSIRD_screencaptureui_DoM6su/Screenshot 2026-08-03 at 10.40.36 AM.png`
- Lab implementation: `/tmp/gm-lab-final-normalized.png`
- Monitor implementation: `/tmp/gm-monitor-final.png`
- Combined Lab comparison: `/tmp/gm-lab-comparison-final.png`
- Route state: light theme by default; first matrix condition expanded; Wallet mode active
- Source Lab pixels: 3832 × 1960 at 2× density
- Normalized source pixels: 1901 × 972 at 1× density
- Implementation pixels: 1901 × 972 at 1× density
- CSS viewport target: 1916 × 980; screenshot content excludes browser scrollbar/chrome

## Full-view comparison evidence

The source and implementation were normalized and placed in one side-by-side image. The final Lab keeps the source typography, neutral tokens, density, header, controls, matrix rows, and expanded-row treatment. The content frame now matches the 1384px header and Basis frame by request. The matrix occupies the primary left surface and the explanatory material occupies a right rail, matching the Basis page structure.

## Focused evidence

The expanded first matrix row remains readable in the full-size comparison, so a second crop was not needed. The Basis annotation was checked against the rendered table and DOM: the table now has four headers—Asset, Token price / token, Underlying close / share, and Updated. No Basis header or `Multiplier required` row is rendered.

## Required fidelity surfaces

- Fonts and typography: Geist and Geist Mono remain consistent with the source. Heading, label, body, and code hierarchy are preserved.
- Spacing and layout: the Lab uses the same 1384px frame, 24px outer gutter, compact status bar, left primary surface, and right rail as the Basis page.
- Colors and tokens: neutral light/dark foundations with green premium and red discount indicators. The labels include text and percentages, so meaning does not depend on color alone.
- Image quality and assets: no raster imagery is required. Interface icons use the existing Lucide library.
- Copy and content: the first screen now explains the tool as a production-readiness sign-off matrix and connects the twelve conditions to acceptance criteria, fixtures, launch gates, and monitoring.

## Comparison history

1. P1: the first revision used a 1760px Lab frame, wider than the application header. Fixed by returning to the shared 1384px frame.
2. P1: the Lab explanation initially sat above the matrix and pushed the core interaction down. Fixed by moving it into a Basis-style right rail.
3. P1: the Basis table still showed inferred multiplier rows and a Basis column. Fixed by excluding multiplier-dependent rows and removing the column.
4. P1: theme bootstrapping emitted a React client-navigation script error. Fixed by removing layout-level scripts and initializing the theme inside the client theme control; client navigation now logs no warnings or errors.
5. P2: the monitor did not expose weekend direction at a glance. Fixed with labeled premium/discount indicators and selected-row explanatory copy.
6. P2: the app inherited the operating-system theme for first-time visitors. Fixed by making light mode the default while preserving an explicit saved preference.

## Interaction and responsive checks

- Wallet, Exchange, and Fintech app mode switching works.
- Replay reruns the fixtures.
- Matrix rows expand and collapse.
- Basis table selection updates the detail rail.
- Theme switching works through client navigation.
- Checked at 390 × 844, 1440 × 1024, and the normalized desktop comparison viewport.
- Browser console warnings and errors: none.

## Implementation checklist

- [x] Match the Lab width to the shared application frame.
- [x] Use the Basis status-bar, primary-surface, and right-rail layout pattern.
- [x] Explain the product and interview rationale above the fold.
- [x] Remove the Basis column and multiplier-dependent rows.
- [x] Remove the client-navigation script warning.
- [x] Verify interactions, responsive behavior, type safety, and production build.

final result: passed

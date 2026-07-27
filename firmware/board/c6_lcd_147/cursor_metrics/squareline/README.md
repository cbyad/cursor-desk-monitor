# SquareLine Studio — Cursor Metrics UI

Project file: `cursor_metrics.spj` (SquareLine 1.6.1, LVGL 8.3.11).

Exported UI lives in `../src/ui/`. Re-export overwrites that folder; keep widget names identical so `ui_metrics/` keeps working.

## Object naming (SquareLine)

SquareLine object **Name** must:

- start with a letter
- use only letters, numbers, and spaces
- be unique

Underscores are **not** allowed. Use camelCase (no spaces in names is fine too).

Exported C globals are prefixed with `ui_` (e.g. object `includedTitleLabel` → `ui_includedTitleLabel`).

## Project settings (File → Project Settings)

| Setting | Value |
|---------|--------|
| Resolution | **172 × 320** (portrait) |
| Color depth | **16 bit** |
| LVGL version | **8.3.11** (must match `platformio.ini`) |
| Board template | Arduino / ESP32 |
| UI export path | `firmware/board/c6_lcd_147/cursor_metrics/src/ui` |
| LVGL include path | `lvgl.h` |

Save project as: `squareline/cursor_metrics.spj`

## Screen & widget names (required)

| SquareLine Name | C global | Type |
|-----------------|----------|------|
| `Screen` | `ui_Screen` | Screen (root) |
| `includedTitleLabel` | `ui_includedTitleLabel` | Label |
| `includedUsageBar` | `ui_includedUsageBar` | Bar (0–100) |
| `includedAmountLabel` | `ui_includedAmountLabel` | Label |
| `includedCycleLabel` | `ui_includedCycleLabel` | Label |
| `paidTitleLabel` | `ui_paidTitleLabel` | Label |
| `paidUsageBar` | `ui_paidUsageBar` | Bar (0–100) |
| `paidAmountLabel` | `ui_paidAmountLabel` | Label |

`ui_metrics/ui_metrics.cpp` updates the four dynamic widgets: both bars, `includedAmountLabel`, `includedCycleLabel`, and `paidAmountLabel`.

## Export workflow

1. **File → Save**
2. **Export → Export UI Files** → `../src/ui/`
3. If build fails on LVGL include, ensure `src/ui/ui.h` has `#include "lvgl.h"`
4. Rebuild: `pio run`

Only edit generated files for the include fix. Logic stays in `src/ui_metrics/`.

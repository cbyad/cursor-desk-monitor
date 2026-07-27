# Cursor Metrics — ESP32-C6-LCD-1.47

LVGL **8.3.11** usage dashboard for the Waveshare [ESP32-C6-LCD-1.47](https://www.waveshare.com/wiki/ESP32-C6-LCD-1.47) (172×320, ST7789).

Phase 1: hardcoded demo metrics on screen. No serial/desktop link yet.

## Prerequisites

- [PlatformIO](https://platformio.org/) (CLI or VS Code extension)
- USB-C cable
- SquareLine Studio (optional) — see [squareline/README.md](squareline/README.md)

**ESP32-C6 + Arduino** uses the [pioarduino](https://github.com/pioarduino/platform-espressif32) platform (configured in `platformio.ini`). First build downloads toolchains (~1–2 GB).

## Build & flash

```bash
cd firmware/board/c6_lcd_147/cursor_metrics
pio run
pio run -t upload
pio device monitor
```

If upload fails, hold **BOOT**, press **RESET**, release **BOOT**, retry upload.

## LVGL version lock

| Component | Version |
|-----------|---------|
| PlatformIO `lib_deps` | `lvgl/lvgl@8.3.11` |
| SquareLine project | **8.3.11** |

Mismatch breaks compile or causes runtime glitches.

## Project layout

```
src/
  main.cpp              # init + demo metrics
  display/              # ST7789 + LVGL driver
  ui/                   # SquareLine export (generated — do not edit)
  ui_metrics/           # ui_apply_metrics() — safe to keep across re-exports
squareline/             # SquareLine .spj + docs
include/lv_conf.h
```

UI is designed in SquareLine (`squareline/cursor_metrics.spj`) and exported to `src/ui/`. Runtime updates go through `ui_metrics/` only.

## Demo screen

```
Included Usage
$20.00 / $20.00 base (14%)
Ends 17/06/2026, 14:34 (6 days left)

Paid Usage
$0.00 / $15.00 (hard limit) (0%)
```

## SquareLine re-export

1. Open `squareline/cursor_metrics.spj` in SquareLine Studio
2. **Export → Export UI Files** → `src/ui/`
3. Confirm `src/ui/ui.h` includes `lvgl.h` (SquareLine 1.6+ usually exports this correctly)
4. `pio run -t upload`

Keep widget names unchanged (see [squareline/README.md](squareline/README.md)). Do **not** put update logic in generated `ui/*.c` — use `ui_metrics/ui_metrics.cpp` only.

## Pin map (Waveshare wiki)

| LCD | GPIO |
|-----|------|
| MOSI | 6 |
| SCLK | 7 |
| CS | 14 |
| DC | 15 |
| RST | 21 |
| BL | 22 |

## Troubleshooting

- **Blank screen:** check backlight (GPIO 22), try `setRotation(0..3)` in `display_st7789.cpp`
- **Wrong colors:** `invertDisplay(true)` is enabled for this panel
- **Build errors after SquareLine export:** LVGL version or `ui.h` include path

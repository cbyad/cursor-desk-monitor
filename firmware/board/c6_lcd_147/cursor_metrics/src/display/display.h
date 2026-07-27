#pragma once

#include <lvgl.h>

// Physical ST7789 panel (portrait)
#define PANEL_WIDTH 172
#define PANEL_HEIGHT 320

// LVGL logical resolution (landscape)
#define LCD_WIDTH 320
#define LCD_HEIGHT 172

// ST7789 uses invertDisplay(true): invert RGB so design hex matches the physical panel.
static inline lv_color_t disp_color(uint32_t rgb24) {
  return lv_color_make(
    (uint8_t)(255 - ((rgb24 >> 16) & 0xFF)),
    (uint8_t)(255 - ((rgb24 >> 8) & 0xFF)),
    (uint8_t)(255 - (rgb24 & 0xFF))
  );
}

bool display_init(void);
void display_lvgl_tick(uint32_t elapsed_ms);

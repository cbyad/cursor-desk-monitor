#pragma once

#include <lvgl.h>

#define LCD_WIDTH 172
#define LCD_HEIGHT 320

bool display_init(void);
void display_lvgl_tick(uint32_t elapsed_ms);

#include "display.h"

#include <Arduino.h>
#include <Arduino_GFX_Library.h>

// Waveshare ESP32-C6-LCD-1.47 pin map (wiki)
static constexpr int PIN_LCD_MOSI = 6;
static constexpr int PIN_LCD_SCLK = 7;
static constexpr int PIN_LCD_CS = 14;
static constexpr int PIN_LCD_DC = 15;
static constexpr int PIN_LCD_RST = 21;
static constexpr int PIN_LCD_BL = 22;

static Arduino_DataBus *bus = nullptr;
static Arduino_GFX *gfx = nullptr;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf1[LCD_WIDTH * 40];
static lv_disp_drv_t disp_drv;

static void lvgl_flush_cb(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
  const uint32_t w = area->x2 - area->x1 + 1;
  const uint32_t h = area->y2 - area->y1 + 1;

  gfx->draw16bitRGBBitmap(area->x1, area->y1, reinterpret_cast<uint16_t *>(color_p), w, h);
  lv_disp_flush_ready(disp);
}

bool display_init(void) {
  pinMode(4, OUTPUT);
  digitalWrite(4, HIGH);

  pinMode(PIN_LCD_BL, OUTPUT);
  digitalWrite(PIN_LCD_BL, HIGH);

  bus = new Arduino_HWSPI(PIN_LCD_DC, PIN_LCD_CS, PIN_LCD_SCLK, PIN_LCD_MOSI, 5);
  gfx = new Arduino_ST7789(
    bus,
    PIN_LCD_RST,
    0,
    true,
    LCD_WIDTH,
    LCD_HEIGHT,
    34,
    0,
    34,
    0
  );

  if (!gfx->begin()) {
    Serial.println("display: ST7789 begin failed");
    return false;
  }

  gfx->setRotation(2);
  gfx->invertDisplay(true);
  gfx->fillScreen(BLACK);

  lv_init();

  lv_disp_draw_buf_init(&draw_buf, buf1, nullptr, LCD_WIDTH * 40);
  lv_disp_drv_init(&disp_drv);
  disp_drv.hor_res = LCD_WIDTH;
  disp_drv.ver_res = LCD_HEIGHT;
  disp_drv.flush_cb = lvgl_flush_cb;
  disp_drv.draw_buf = &draw_buf;
  lv_disp_drv_register(&disp_drv);

  Serial.println("display: LVGL ready");
  return true;
}

void display_lvgl_tick(uint32_t elapsed_ms) { lv_tick_inc(elapsed_ms); }

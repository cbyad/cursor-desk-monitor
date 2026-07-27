#include <Arduino.h>

#include "display/display.h"
#include "serial/serial_receiver.h"
#include "ui/ui.h"
#include "ui/ui_Screen.h"
#include "ui_metrics/ui_metrics.h"

static const metrics_view_t kDemoMetrics = {
  .included_used_usd = 0.0f,
  .included_base_usd = 0.0f,
  .included_percent = 0.0f,
  .paid_used_usd = 0.0f,
  .paid_limit_usd = 0.0f,
  .paid_percent = 0.0f,
  .cycle_end_text = "Ends DD/MM/YYYY, HH:MM (DD days left)"
};

static uint32_t last_tick_ms = 0;
static bool display_ok = false;

void setup() {
#if ARDUINO_USB_CDC_ON_BOOT
  Serial.begin(115200);
  Serial.setTxTimeoutMs(0);
#else
  Serial.begin(115200);
#endif
  delay(500);
  Serial.println("cursor_metrics: boot");

  display_ok = display_init();
  if (!display_ok) {
    Serial.println("cursor_metrics: display init failed");
    serial_receiver_init();
    return;
  }

  ui_init();
  ui_apply_theme();
  ui_apply_metrics(&kDemoMetrics);
  lv_obj_invalidate(ui_Screen);
  lv_refr_now(nullptr);
  last_tick_ms = millis();

  serial_receiver_init();

  Serial.println("cursor_metrics: UI ready");
}

void loop() {
  serial_receiver_poll();

  if (!display_ok) {
    delay(10);
    return;
  }

  const uint32_t now = millis();
  const uint32_t elapsed = now - last_tick_ms;
  last_tick_ms = now;

  display_lvgl_tick(elapsed);
  lv_timer_handler();
  delay(5);
}

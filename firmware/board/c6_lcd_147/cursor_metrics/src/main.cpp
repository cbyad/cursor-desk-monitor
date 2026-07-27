#include <Arduino.h>

#include "display/display.h"
#include "ui/ui.h"
#include "ui_metrics/ui_metrics.h"

static const metrics_view_t kDemoMetrics = {
  .included_used_usd = 20.0f,
  .included_base_usd = 20.0f,
  .included_percent = 14.0f,
  .paid_used_usd = 0.0f,
  .paid_limit_usd = 15.0f,
  .paid_percent = 0.0f,
  .cycle_end_text = "Ends 17/06/2026, 14:34 (6 days left)"
};

static uint32_t last_tick_ms = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("cursor_metrics: boot");

  if (!display_init()) {
    Serial.println("cursor_metrics: display init failed");
    return;
  }

  ui_init();
  ui_apply_metrics(&kDemoMetrics);
  last_tick_ms = millis();

  Serial.println("cursor_metrics: UI ready");
}

void loop() {
  const uint32_t now = millis();
  const uint32_t elapsed = now - last_tick_ms;
  last_tick_ms = now;

  display_lvgl_tick(elapsed);
  lv_timer_handler();
  delay(5);
}

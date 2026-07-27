#include "serial_receiver.h"

#include <Arduino.h>
#include <ArduinoJson.h>
#include <cstring>

#include "ui/ui.h"
#include "ui/ui_Screen.h"
#include "ui_metrics/ui_metrics.h"

static constexpr size_t kLineBufferSize = 512;
static char line_buffer[kLineBufferSize];
static size_t line_length = 0;
static char cycle_buf[80];
static metrics_view_t metrics_view;

static bool parse_metrics_line(const char *line) {
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, line);
  if (error) {
    Serial.print("serial: invalid payload (");
    Serial.print(error.c_str());
    Serial.println(")");
    return false;
  }

  const int schema_version = doc["schemaVersion"].is<int>() ? doc["schemaVersion"].as<int>() : 0;
  if (schema_version != 1) {
    Serial.println("serial: invalid payload (schema)");
    return false;
  }

  metrics_view.included_used_usd = doc["includedUsedUsd"] | 0.0f;
  metrics_view.included_base_usd = doc["includedBaseUsd"] | 0.0f;
  metrics_view.included_percent = doc["includedPercent"] | 0.0f;
  metrics_view.paid_used_usd = doc["paidUsedUsd"] | 0.0f;
  metrics_view.paid_limit_usd = doc["paidLimitUsd"] | 0.0f;
  metrics_view.paid_percent = doc["paidPercent"] | 0.0f;

  const char *cycle_text = doc["cycleEndText"].is<const char *>() ? doc["cycleEndText"].as<const char *>() : "";
  strncpy(cycle_buf, cycle_text, sizeof(cycle_buf) - 1);
  cycle_buf[sizeof(cycle_buf) - 1] = '\0';
  metrics_view.cycle_end_text = cycle_buf;

  return true;
}

void serial_receiver_init(void) {
  line_length = 0;
  Serial.println("serial: listening");
}

void serial_receiver_poll(void) {
  while (Serial.available() > 0) {
    const char ch = static_cast<char>(Serial.read());

    if (ch == '\r') {
      continue;
    }

    if (ch == '\n') {
      if (line_length == 0) {
        continue;
      }

      line_buffer[line_length] = '\0';
      if (parse_metrics_line(line_buffer)) {
        ui_apply_metrics(&metrics_view);
        if (ui_Screen != nullptr) {
          lv_obj_invalidate(ui_Screen);
          lv_refr_now(nullptr);
        }
        Serial.println("serial: metrics updated");
      }

      line_length = 0;
      continue;
    }

    if (line_length >= kLineBufferSize - 1) {
      line_length = 0;
      Serial.println("serial: line too long");
      continue;
    }

    line_buffer[line_length++] = ch;
  }
}

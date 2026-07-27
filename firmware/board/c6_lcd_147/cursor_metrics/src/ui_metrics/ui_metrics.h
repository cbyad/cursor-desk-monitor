#pragma once

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
  float included_used_usd;
  float included_base_usd;
  float included_percent;
  float paid_used_usd;
  float paid_limit_usd;
  float paid_percent;
  const char *cycle_end_text;
} metrics_view_t;

void ui_apply_metrics(const metrics_view_t *metrics);

#ifdef __cplusplus
}
#endif

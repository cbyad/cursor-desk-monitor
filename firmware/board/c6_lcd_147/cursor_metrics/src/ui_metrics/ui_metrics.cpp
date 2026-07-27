#include "ui_metrics.h"

#include <cstdio>

#include "ui/ui.h"

void ui_apply_metrics(const metrics_view_t *m) {
  if (m == nullptr) {
    return;
  }

  char amount_buf[64];
  char paid_buf[72];

  std::snprintf(
    amount_buf,
    sizeof(amount_buf),
    "$%.2f / $%.2f base (%.0f%%)",
    m->included_used_usd,
    m->included_base_usd,
    m->included_percent
  );

  std::snprintf(
    paid_buf,
    sizeof(paid_buf),
    "$%.2f / $%.2f (hard limit) (%.0f%%)",
    m->paid_used_usd,
    m->paid_limit_usd,
    m->paid_percent
  );

  lv_bar_set_value(ui_includedUsageBar, static_cast<int32_t>(m->included_percent), LV_ANIM_OFF);
  lv_bar_set_value(ui_paidUsageBar, static_cast<int32_t>(m->paid_percent), LV_ANIM_OFF);
  lv_label_set_text(ui_includedAmountLabel, amount_buf);
  lv_label_set_text(ui_includedCycleLabel, m->cycle_end_text);
  lv_label_set_text(ui_paidAmountLabel, paid_buf);
}

# Field mapping: API → UsageSummary

Dashboard reference (Pro account):

| UI block | Dashboard example |
|----------|-------------------|
| Included Usage | `$16.68 / $60 base` |
| Included progress | ~27% filled |
| Cycle end | `Ends 19/10/2025, 19:59 (19 days left)` |
| Paid Usage | `$7.12 / $150 (hard limit)` |

## JSON paths

| UsageSummary field | API source | Transform |
|--------------------|------------|-----------|
| `includedUsedUsd` | `individualUsage.plan.used` | cents → USD (`/ 100`) |
| `includedBaseUsd` | `individualUsage.plan.limit` | cents → USD (`/ 100`) |
| `includedPercent` | `individualUsage.plan.totalPercentUsed` or `used/limit * 100` | clamp 0–100 |
| `paidUsedUsd` | `individualUsage.onDemand.used` | cents → USD (`/ 100`) |
| `paidLimitUsd` | `individualUsage.onDemand.limit` or `PAID_LIMIT_USD` config | cents → USD; config fallback when `limit` is null |
| `paidPercent` | `paidUsedUsd / paidLimitUsd * 100` | clamp 0–100 |
| `cycleEndEpoch` | `billingCycleEnd` | ISO 8601 → Unix ms |
| `daysLeft` | `billingCycleEnd` | whole days from now |
| `fetchedAt` | — | `Date.now()` at process time |
| `status` | — | `"ok"` on success |

## Notes

- Dollar amounts on the dashboard are stored as **cents** in `individualUsage.plan` and `individualUsage.onDemand`.
- `membershipType: "pro"` uses `individualUsage`; team fields are ignored for individual plans.
- If `onDemand.limit` is null, set `paidLimitUsd` from optional `PAID_LIMIT_USD` env config.

Fixture: [../fixtures/usage-summary.pro.json](../fixtures/usage-summary.pro.json)

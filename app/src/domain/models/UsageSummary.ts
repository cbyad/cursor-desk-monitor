import { Schema } from 'effect'

export const UsageSummaryStatus = Schema.Literal('ok', 'auth_error', 'api_error')

export const UsageSummary = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  // fetchedAt: Schema.Number,
  includedUsedUsd: Schema.Number,
  includedBaseUsd: Schema.Number,
  includedPercent: Schema.Number,
  paidUsedUsd: Schema.Number,
  paidLimitUsd: Schema.Number,
  paidPercent: Schema.Number,
  // cycleEndEpoch: Schema.Number,
  // daysLeft: Schema.Number,
  cycleEndText: Schema.String
  // status: UsageSummaryStatus
})

export type UsageSummary = Schema.Schema.Type<typeof UsageSummary>

export const encodeUsageSummary = Schema.encode(Schema.parseJson(UsageSummary))

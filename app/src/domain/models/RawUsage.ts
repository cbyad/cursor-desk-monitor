import { Schema } from 'effect'

const PlanUsage = Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
  used: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.NullOr(Schema.Number)),
  remaining: Schema.optional(Schema.NullOr(Schema.Number)),
  breakdown: Schema.optional(
    Schema.Struct({
      included: Schema.optional(Schema.Number),
      bonus: Schema.optional(Schema.Number),
      total: Schema.optional(Schema.Number)
    })
  ),
  autoPercentUsed: Schema.optional(Schema.Number),
  apiPercentUsed: Schema.optional(Schema.Number),
  totalPercentUsed: Schema.optional(Schema.Number)
})

const OnDemandUsage = Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
  used: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.optional(Schema.NullOr(Schema.Number)),
  remaining: Schema.optional(Schema.NullOr(Schema.Number))
})

const IndividualUsage = Schema.Struct({
  plan: Schema.optional(PlanUsage),
  onDemand: Schema.optional(OnDemandUsage)
})

export const RawUsage = Schema.Struct({
  billingCycleStart: Schema.optional(Schema.String),
  billingCycleEnd: Schema.optional(Schema.String),
  membershipType: Schema.optional(Schema.String),
  limitType: Schema.optional(Schema.String),
  isUnlimited: Schema.optional(Schema.Boolean),
  autoModelSelectedDisplayMessage: Schema.optional(Schema.String),
  namedModelSelectedDisplayMessage: Schema.optional(Schema.String),
  individualUsage: Schema.optional(IndividualUsage),
  teamUsage: Schema.optional(
    Schema.Struct({
      onDemand: Schema.optional(OnDemandUsage)
    })
  )
})

export type RawUsage = Schema.Schema.Type<typeof RawUsage>

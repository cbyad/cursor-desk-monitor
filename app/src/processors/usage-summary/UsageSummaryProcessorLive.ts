import { Effect, Layer, Option } from 'effect'
import { AppConfig } from '../../config/Config.ts'
import { DecodeError } from '../../domain/errors/DecodeError.ts'
import type { RawUsage } from '../../domain/models/RawUsage.ts'
import type { UsageSummary } from '../../domain/models/UsageSummary.ts'
import { Processor } from '../../domain/ports/Processor.ts'

const centsToUsd = (cents: number): number => cents / 100

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value))

const computePercent = (used: number, limit: number, fallback?: number): number => {
  if (fallback!==undefined) return clampPercent(fallback)
  if (limit <= 0) return 0
  return clampPercent((used / limit) * 100)
}

const computeDaysLeft = (cycleEndEpoch: number): number => {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((cycleEndEpoch - Date.now()) / msPerDay))
}

const mapRawToSummary = (raw: RawUsage & { billingCycleEnd: string }, paidLimitFallback?: number): UsageSummary => {
  const plan = raw.individualUsage?.plan
  const onDemand = raw.individualUsage?.onDemand

  const includedUsedCents = plan?.used ?? 0
  const includedBaseCents = plan?.limit ?? plan?.breakdown?.total ?? 0
  const includedUsedUsd = centsToUsd(includedUsedCents)
  const includedBaseUsd = centsToUsd(includedBaseCents)
  const includedPercent = computePercent(includedUsedCents, includedBaseCents, plan?.totalPercentUsed)

  const paidUsedCents = onDemand?.used ?? 0
  const paidLimitCents = onDemand?.limit ?? (paidLimitFallback !== undefined ? paidLimitFallback * 100 : 0)
  const paidUsedUsd = centsToUsd(paidUsedCents)
  const paidLimitUsd = centsToUsd(paidLimitCents)
  const paidPercent = computePercent(paidUsedCents, paidLimitCents)

  const cycleEndEpoch = new Date(raw.billingCycleEnd).getTime()

  return {
    schemaVersion: 1,
    fetchedAt: Date.now(),
    includedUsedUsd,
    includedBaseUsd,
    includedPercent,
    paidUsedUsd,
    paidLimitUsd,
    paidPercent,
    cycleEndEpoch,
    daysLeft: computeDaysLeft(cycleEndEpoch),
    status: 'ok'
  }
}

export const UsageSummaryProcessorLive = Layer.effect(
  Processor,
  Effect.gen(function* () {
    const config = yield* AppConfig
    const paidLimitFallback = Option.getOrUndefined(config.paidLimitUsd)

    const process = (raw: RawUsage) =>
      Effect.gen(function* () {
        if (!raw.billingCycleEnd) 
          return yield* Effect.fail(new DecodeError({ message: 'billingCycleEnd is missing from API response' }))
        return mapRawToSummary({ ...raw, billingCycleEnd: raw.billingCycleEnd }, paidLimitFallback)
      })

    return { process }
  })
)

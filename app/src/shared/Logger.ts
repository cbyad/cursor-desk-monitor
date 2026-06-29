import { BunContext } from '@effect/platform-bun'

export const LoggerLive = BunContext.layer

export const formatUsd = (amount: number): string => `$${amount.toFixed(2)}`

export const formatCycleEnd = (epochMs: number): string => {
  const date = new Date(epochMs)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export const formatUsageBlocks = (summary: {
  includedUsedUsd: number
  includedBaseUsd: number
  includedPercent: number
  paidUsedUsd: number
  paidLimitUsd: number
  paidPercent: number
  cycleEndEpoch: number
  daysLeft: number
}): readonly string[] => [
  'Included Usage',
  `${formatUsd(summary.includedUsedUsd)} / ${formatUsd(summary.includedBaseUsd)} base (${summary.includedPercent.toFixed(0)}%)`,
  `Ends ${formatCycleEnd(summary.cycleEndEpoch)} (${summary.daysLeft} days left)`,
  '',
  'Paid Usage',
  `${formatUsd(summary.paidUsedUsd)} / ${formatUsd(summary.paidLimitUsd)} (hard limit) (${summary.paidPercent.toFixed(0)}%)`
]

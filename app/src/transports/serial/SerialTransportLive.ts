import { Effect, Layer } from 'effect'
import { TransportError } from '../../domain/errors/TransportError.ts'
import type { UsageSummary } from '../../domain/models/UsageSummary.ts'
import { Transport } from '../../domain/ports/Transport.ts'

export const SerialTransportLive = Layer.succeed(Transport, {
  publish: (_summary: UsageSummary) =>
    Effect.fail(
      new TransportError({
        message: 'Serial transport is not implemented yet. Set TRANSPORT=log or wire the ESP32 serial layer.'
      })
    )
})

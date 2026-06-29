import { Effect, Layer, Schema } from 'effect'
import { AppConfig } from '../../config/Config.ts'
import { TransportError } from '../../domain/errors/TransportError.ts'
import { UsageSummary } from '../../domain/models/UsageSummary.ts'
import { Transport } from '../../domain/ports/Transport.ts'
import { formatUsageBlocks } from '../../shared/Logger.ts'

export const LogTransportLive = Layer.effect(
  Transport,
  Effect.gen(function* () {
    const config = yield* AppConfig

    const publish = (summary: UsageSummary) =>
      Effect.gen(function* () {
        const lines = formatUsageBlocks(summary)
        for (const line of lines) {
          yield* Effect.logInfo(line)
        }

        if (config.logPayloadJson) {
          const json = yield* Schema.encode(Schema.parseJson(UsageSummary))(summary).pipe(
            Effect.mapError(
              (cause) =>
                new TransportError({
                  message: 'Failed to encode usage summary payload',
                  cause
                })
            )
          )
          yield* Effect.logInfo(`payload: ${json}`)
        }
      })

    return { publish }
  })
)

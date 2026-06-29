import { Effect, Layer, Schema } from 'effect'
import { DecodeError } from '../../domain/errors/DecodeError.ts'
import { RawUsage } from '../../domain/models/RawUsage.ts'
import { Collector } from '../../domain/ports/Collector.ts'
import { HttpClient } from '../../shared/HttpClient.ts'

export const CursorCollectorLive = Layer.effect(
  Collector,
  Effect.gen(function* () {
    const httpClient = yield* HttpClient

    const collect = httpClient.get('/api/usage-summary').pipe(
      Effect.tap(() => Effect.logInfo('Collecting usage from Cursor API')),
      Effect.flatMap((body) =>
        Schema.decodeUnknown(RawUsage)(body).pipe(
          Effect.mapError(
            (cause) =>
              new DecodeError({
                message: 'Failed to decode usage-summary response',
                cause
              })
          )
        )
      ),
      Effect.tap(() => Effect.logInfo('Usage collection completed'))
    )

    return { collect }
  })
)

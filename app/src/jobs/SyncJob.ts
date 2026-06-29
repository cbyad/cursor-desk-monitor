import { Effect, Schedule } from 'effect'
import { AppConfig } from '../config/Config.ts'
import type { ApiError } from '../domain/errors/ApiError.ts'
import type { AuthError } from '../domain/errors/AuthError.ts'
import type { DecodeError } from '../domain/errors/DecodeError.ts'
import type { TransportError } from '../domain/errors/TransportError.ts'
import { Collector } from '../domain/ports/Collector.ts'
import { Processor } from '../domain/ports/Processor.ts'
import { Transport } from '../domain/ports/Transport.ts'

const syncPipeline = Effect.gen(function* () {
  const collector = yield* Collector
  const processor = yield* Processor
  const transport = yield* Transport

  const raw = yield* collector.collect
  const summary = yield* processor.process(raw)
  yield* transport.publish(summary)
})

export const runOnce = Effect.gen(function* () {
  yield* Effect.logInfo('Sync job started')
  yield* syncPipeline
  yield* Effect.logInfo('Sync job completed')
}).pipe(
  Effect.catchTag('AuthError', (error: AuthError) => Effect.logWarning(error.message)),
  Effect.catchTag('ApiError', (error: ApiError) => Effect.logError(`API error ${error.status}: ${error.message}`)),
  Effect.catchTag('DecodeError', (error: DecodeError) => Effect.logError(`Decode error: ${error.message}`)),
  Effect.catchTag('TransportError', (error: TransportError) => Effect.logError(`Transport error: ${error.message}`))
)

export const runScheduled = Effect.gen(function* () {
  const { syncInterval } = yield* AppConfig
  yield* Effect.logInfo(`Scheduler started (interval: ${syncInterval})`)
  yield* runOnce
  yield* runOnce.pipe(Effect.repeat(Schedule.spaced(syncInterval)))
})

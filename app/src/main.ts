import { BunRuntime } from '@effect/platform-bun'
import { Effect, Redacted } from 'effect'
import { AppConfig } from './config/Config.ts'
import { runOnce, runScheduled } from './jobs/SyncJob.ts'
import { AppLayer } from './layers/AppLayer.ts'

const isOnceMode = process.argv.includes('--once')

const program = Effect.gen(function* () {
  const config = yield* AppConfig
  yield* Effect.logInfo(`Cursor Metrics starting (transport=${config.transport}, interval=${config.syncInterval})`)
  yield* Effect.logInfo(`Session token: ${Redacted.value(config.cursorSessionToken).slice(0, 8)}…`)

  if (isOnceMode) yield* runOnce
  else yield* runScheduled
})

BunRuntime.runMain(program.pipe(Effect.provide(AppLayer)))

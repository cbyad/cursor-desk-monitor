import { Config } from 'effect'

export const TransportType = Config.literal(
  'log',
  'serial',
  'mqtt'
)('TRANSPORT').pipe(Config.withDefault('log' as const))

export const CursorSessionToken = Config.redacted('CURSOR_SESSION_TOKEN')

export const CursorApiBase = Config.string('CURSOR_API_BASE').pipe(Config.withDefault('https://cursor.com'))

export const SyncInterval = Config.duration('SYNC_INTERVAL').pipe(Config.withDefault('10 minutes'))

export const PaidLimitUsd = Config.option(Config.number('PAID_LIMIT_USD'))

export const LogPayloadJson = Config.boolean('LOG_PAYLOAD_JSON').pipe(Config.withDefault(true))

export const AppConfig = Config.all({
  transport: TransportType,
  cursorSessionToken: CursorSessionToken,
  cursorApiBase: CursorApiBase,
  syncInterval: SyncInterval,
  paidLimitUsd: PaidLimitUsd,
  logPayloadJson: LogPayloadJson
})

export type AppConfig = Config.Config.Success<typeof AppConfig>

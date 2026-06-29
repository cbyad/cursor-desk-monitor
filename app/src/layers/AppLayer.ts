import { Effect, Layer } from 'effect'
import { CursorCollectorLive } from '../collectors/cursor/CursorCollectorLive.ts'
import { AppConfig } from '../config/Config.ts'
import { EnvironmentLive } from '../config/Environment.ts'
import { UsageSummaryProcessorLive } from '../processors/usage-summary/UsageSummaryProcessorLive.ts'
import { HttpClientLive } from '../shared/HttpClient.ts'
import { LoggerLive } from '../shared/Logger.ts'
import { LogTransportLive } from '../transports/log/LogTransportLive.ts'
import { MqttTransportLive } from '../transports/mqtt/MqttTransportLive.ts'
import { SerialTransportLive } from '../transports/serial/SerialTransportLive.ts'

const TransportLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { transport } = yield* AppConfig
    switch (transport) {
      case 'log':
        return LogTransportLive
      case 'serial':
        return SerialTransportLive
      case 'mqtt':
        return MqttTransportLive
    }
  })
)

const ServicesLayer = CursorCollectorLive.pipe(
  Layer.provide(HttpClientLive),
  Layer.provideMerge(UsageSummaryProcessorLive),
  Layer.provideMerge(TransportLayer)
)

export const AppLayer = Layer.mergeAll(LoggerLive, EnvironmentLive, ServicesLayer)

import { Effect, Layer, Schedule } from 'effect'
import { SerialPort } from 'serialport'
import { SerialConfig } from '../../config/SerialConfig.ts'
import { TransportError } from '../../domain/errors/TransportError.ts'
import type { UsageSummary } from '../../domain/models/UsageSummary.ts'
import { encodeUsageSummary } from '../../domain/models/UsageSummary.ts'
import { Transport } from '../../domain/ports/Transport.ts'

const isPortLockError = (cause: unknown): boolean => {
  const message = cause instanceof Error ? cause.message : String(cause)
  return message.includes('Cannot lock port') || message.includes('Resource temporarily unavailable')
}

const openPort = (portPath: string, baudRate: number): Effect.Effect<SerialPort, TransportError> =>
  Effect.tryPromise({
    try: () =>
      new Promise<SerialPort>((resolve, reject) => {
        const port = new SerialPort(
          {
            path: portPath,
            baudRate,
            autoOpen: true,
            endOnClose: true,
            hupcl: false
          },
          (err) => {
            if (err) {
              reject(err)
              return
            }
            resolve(port)
          }
        )
      }),
    catch: (cause) =>
      new TransportError({
        message: `Failed to open serial port ${portPath}`,
        cause
      })
  }).pipe(
    Effect.retry({
      schedule: Schedule.spaced('250 millis'),
      times: 4,
      while: (error) => isPortLockError(error.cause)
    })
  )

const configurePort = (port: SerialPort): Effect.Effect<void, TransportError> =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        port.set({ dtr: false, rts: false, hupcl: false }, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      }),
    catch: (cause) =>
      new TransportError({
        message: 'Failed to configure serial port control lines',
        cause
      })
  })

const closePort = (port: SerialPort): Effect.Effect<void, never> =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve) => {
        if (!port.isOpen) {
          resolve()
          return
        }

        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }

        const timeout = setTimeout(() => {
          port.destroy()
          finish()
        }, 500)

        port.close((err) => {
          clearTimeout(timeout)
          if (err) {
            port.destroy()
          }
          finish()
        })
      }),
    catch: () => undefined
  }).pipe(Effect.catchAll(() => Effect.void))

const writeLine = (port: SerialPort, line: string): Effect.Effect<void, TransportError> =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        port.write(line, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      }),
    catch: (cause) =>
      new TransportError({
        message: 'Failed to write to serial port',
        cause
      })
  })

const drainPort = (port: SerialPort): Effect.Effect<void, TransportError> =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        port.drain((err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      }),
    catch: (cause) =>
      new TransportError({
        message: 'Failed to drain serial port',
        cause
      })
  })

export const SerialTransportLive = Layer.scoped(
  Transport,
  Effect.gen(function* () {
    const { portPath, baudRate } = yield* SerialConfig
    const port = yield* Effect.acquireRelease(
      openPort(portPath, baudRate).pipe(
        Effect.tap((openedPort) => configurePort(openedPort)),
        Effect.tap(() => Effect.sleep('300 millis'))
      ),
      (openedPort) =>
        Effect.gen(function* () {
          yield* drainPort(openedPort).pipe(Effect.catchAll(() => Effect.void))
          yield* closePort(openedPort)
          yield* Effect.sleep('150 millis')
        })
    )

    const publish = (summary: UsageSummary) =>
      Effect.gen(function* () {
        const json = yield* encodeUsageSummary(summary).pipe(
          Effect.mapError(
            (cause) =>
              new TransportError({
                message: 'Failed to encode usage summary payload',
                cause
              })
          )
        )
        const payload = `${json}\n`
        // yield* Effect.logInfo(`${payload}`)
        yield* writeLine(port, payload)
        yield* drainPort(port)
        yield* Effect.logInfo(`serial: published ${payload.length} bytes to ${portPath}`)
      })

    return { publish }
  })
)

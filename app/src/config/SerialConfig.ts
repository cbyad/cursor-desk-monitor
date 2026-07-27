import { Config } from 'effect'

export const SerialPortPath = Config.string('SERIAL_PORT')

export const SerialBaudRate = Config.integer('SERIAL_BAUD_RATE').pipe(Config.withDefault(115200))

export const SerialConfig = Config.all({
  portPath: SerialPortPath,
  baudRate: SerialBaudRate
})

export type SerialConfig = Config.Config.Success<typeof SerialConfig>

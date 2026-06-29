import { ConfigProvider, Layer } from 'effect'

export const EnvironmentLive = Layer.setConfigProvider(ConfigProvider.fromEnv())

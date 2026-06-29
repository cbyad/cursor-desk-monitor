import * as FetchHttpClient from '@effect/platform/FetchHttpClient'
import { HttpClient as PlatformHttpClient } from '@effect/platform/HttpClient'
import { RequestError, ResponseError } from '@effect/platform/HttpClientError'
import { Context, Effect, Layer, Redacted } from 'effect'
import { AppConfig } from '../config/Config.ts'
import { ApiError } from '../domain/errors/ApiError.ts'
import { AuthError } from '../domain/errors/AuthError.ts'

export interface HttpClientService {
  readonly get: (path: string) => Effect.Effect<unknown, AuthError | ApiError>
}

export class HttpClient extends Context.Tag('HttpClient')<HttpClient, HttpClientService>() {}

const mapPlatformError = (error: unknown): ApiError => {
  if (error instanceof ResponseError) {
    return new ApiError({
      status: error.response.status,
      message: error.message
    })
  }

  if (error instanceof RequestError) {
    return new ApiError({
      status: 0,
      message: error.message
    })
  }

  return new ApiError({
    status: 0,
    message: `Network request failed: ${String(error)}`
  })
}

export const HttpClientLive = Layer.effect(
  HttpClient,
  Effect.gen(function* () {
    const config = yield* AppConfig
    const client = yield* PlatformHttpClient

    const get = (path: string): Effect.Effect<unknown, AuthError | ApiError> =>
      Effect.gen(function* () {
        const token = Redacted.value(config.cursorSessionToken)
        const url = `${config.cursorApiBase}${path}`

        const response = yield* client
          .get(url, {
            headers: {
              Cookie: `WorkosCursorSessionToken=${token}`
            }
          })
          .pipe(Effect.mapError(mapPlatformError))

        if (response.status === 401) {
          return yield* Effect.fail(
            new AuthError({
              message:
                'Session cookie expired or invalid. Refresh WorkosCursorSessionToken from cursor.com DevTools → Application → Cookies.'
            })
          )
        }

        if (response.status < 200 || response.status >= 300) {
          const body = yield* response.text.pipe(Effect.mapError(mapPlatformError))
          return yield* Effect.fail(
            new ApiError({
              status: response.status,
              message: body || String(response.status)
            })
          )
        }

        return yield* response.json.pipe(Effect.mapError(mapPlatformError))
      })

    return { get } satisfies HttpClientService
  })
).pipe(Layer.provide(FetchHttpClient.layer))

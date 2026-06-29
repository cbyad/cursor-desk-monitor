import { Context, type Effect } from 'effect'
import type { ApiError } from '../errors/ApiError.ts'
import type { AuthError } from '../errors/AuthError.ts'
import type { DecodeError } from '../errors/DecodeError.ts'
import type { RawUsage } from '../models/RawUsage.ts'

export interface CollectorService {
  readonly collect: Effect.Effect<RawUsage, AuthError | ApiError | DecodeError>
}

export class Collector extends Context.Tag('Collector')<Collector, CollectorService>() {}

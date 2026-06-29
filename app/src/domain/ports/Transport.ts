import { Context, type Effect } from 'effect'
import type { TransportError } from '../errors/TransportError.ts'
import type { UsageSummary } from '../models/UsageSummary.ts'

export interface TransportService {
  readonly publish: (summary: UsageSummary) => Effect.Effect<void, TransportError>
}

export class Transport extends Context.Tag('Transport')<Transport, TransportService>() {}

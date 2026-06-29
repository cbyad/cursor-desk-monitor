import { Context, type Effect } from 'effect'
import type { DecodeError } from '../errors/DecodeError.ts'
import type { RawUsage } from '../models/RawUsage.ts'
import type { UsageSummary } from '../models/UsageSummary.ts'

export interface ProcessorService {
  readonly process: (raw: RawUsage) => Effect.Effect<UsageSummary, DecodeError>
}

export class Processor extends Context.Tag('Processor')<Processor, ProcessorService>() {}

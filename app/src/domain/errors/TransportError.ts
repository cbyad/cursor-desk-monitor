import { Data } from 'effect'

export class TransportError extends Data.TaggedError('TransportError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

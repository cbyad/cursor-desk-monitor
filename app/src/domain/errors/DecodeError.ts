import { Data } from 'effect'

export class DecodeError extends Data.TaggedError('DecodeError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

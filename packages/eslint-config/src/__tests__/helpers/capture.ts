/** Runs `fn` and returns the thrown Error; fails if nothing or a non-Error is thrown. */
export function captureError(fn: () => unknown): Error {
  try {
    fn()
  }
  catch (error) {
    if (error instanceof Error) return error
    throw new Error("Expected an Error to be thrown", { cause: error })
  }
  throw new Error("Expected function to throw")
}

/** Async variant of {@link captureError}. */
export async function captureRejection(fn: () => Promise<unknown>): Promise<Error> {
  try {
    await fn()
  }
  catch (error) {
    if (error instanceof Error) return error
    throw new Error("Expected an Error to be thrown", { cause: error })
  }
  throw new Error("Expected function to reject")
}

/** Returns the options object of a `[severity, options]` rule entry. */
export function ruleOptions(entry: unknown): Record<string, unknown> {
  if (!Array.isArray(entry)) throw new TypeError("Expected a [severity, options] rule entry")
  const options: unknown = entry[1]
  if (typeof options !== "object" || options === null) throw new TypeError("Expected rule options")
  return Object.fromEntries(Object.entries(options))
}

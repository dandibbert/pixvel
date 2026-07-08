export function assertJsonEquals(actual: unknown, expected: unknown) {
  const normalizedActual = sortObjectKeys(actual);
  const normalizedExpected = sortObjectKeys(expected);

  if (JSON.stringify(normalizedActual) !== JSON.stringify(normalizedExpected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertExactJsonEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertStrictEquals(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertThrowsError<T extends Error>(
  fn: () => unknown,
  expectedError: new (...args: never[]) => T,
): T {
  try {
    fn();
  } catch (error) {
    if (error instanceof expectedError) return error;
    throw new Error(`Expected ${expectedError.name}, got ${(error as Error).constructor.name}`);
  }

  throw new Error(`Expected ${expectedError.name} to be thrown`);
}

export function assertThrowsErrorMessage<T extends Error>(
  fn: () => unknown,
  expectedError: new (...args: never[]) => T,
  expectedMessage: string,
) {
  const error = assertThrowsError(fn, expectedError);
  assertStrictEquals(error.message, expectedMessage);
}

export async function assertRejectsError<T extends Error>(
  fn: () => Promise<unknown>,
  expectedError: new (...args: never[]) => T,
): Promise<T> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof expectedError) return error;
    throw new Error(`Expected ${expectedError.name}, got ${(error as Error).constructor.name}`);
  }

  throw new Error(`Expected ${expectedError.name} to be rejected`);
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, sortObjectKeys(nestedValue)]),
    );
  }

  return value;
}

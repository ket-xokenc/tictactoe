let testError;

export function setError(error) {
  testError = error;
}

export function getError() {
  return testError && { ...testError };
}

function errorFactory(defaultStatus) {
  return class extends Error {
    constructor(message, status = defaultStatus) {
      super(message);
      this.message = message;
      this.status = status;
    }
  };
}

export const UnauthorizedError = errorFactory(401);
export const ForbiddenError = errorFactory(403);
export const BadArgumentsError = errorFactory(400);
export const GoneError = errorFactory(410);

export default class MiddlewareError extends Error {
  status: number;
  error: string;

  constructor(errorMessage: string, status = 500) {
    super(errorMessage);

    this.error = errorMessage;
    this.status = status;
  }
}

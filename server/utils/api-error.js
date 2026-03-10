class ApiError extends Error {
  constructor(statusCode, message) {
    super(message); // Call the parent constructor with the message
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // 4xx = fail, 5xx = error
    this.isOperational = true; // EXPECTED ERRORS

    Error.captureStackTrace(this, this.constructor); //Ensure the stack trace is correct for where our error was thrown
  }
}

export default ApiError;

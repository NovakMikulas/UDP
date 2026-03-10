const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // FOR DEV -> RETURNS STACK TRACE AND ERROR DETAILS
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // FOR PROD -> RETURNS ONLY ERROR MESSAGE
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

export default globalErrorHandler;

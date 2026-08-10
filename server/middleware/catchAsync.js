/**
 * catchAsync
 * Wraps asynchronous Express route handlers to automatically catch any thrown errors
 * and forward them to the next middleware (error handler)
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

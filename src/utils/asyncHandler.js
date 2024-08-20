// __________using async await _______________
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,   
      message: err.message,
    });
  }
};

// const asyncHandler = (func) => {
//   console.log("async handler reached");
//   return (req, res, next) => {
//     Promise.resolve(func(req, res, next)).catch((err) => next(err));
//   };
// };

// ________________basic__________________
// const asyncHandler = (fn) => {
//   return async (req,res,next) => {};
// };

export { asyncHandler };

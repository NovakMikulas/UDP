import jwt from "jsonwebtoken";
import ApiError from "../../utils/api-error.js";

const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(
      new ApiError(401, "[MIDDLEWARE] Token is missing."),
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "123");
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new ApiError(401, "[MIDDLEWARE] Token is invalid or has expired."),
    );
  }
};
export default authenticate;

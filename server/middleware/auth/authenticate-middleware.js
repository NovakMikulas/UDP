import jwt from "jsonwebtoken";
import ApiError from "../../utils/api-error.js";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(
        401,
        "[MIDDLEWARE] Token is missing or is not in the correct format.",
      ),
    );
  }

  const token = authHeader.split(" ")[1];

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

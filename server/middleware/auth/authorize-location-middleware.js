import ApiError from "../../utils/api-error.js";
import locationGetDao from "../../dao/location/location-get-dao.js";
const authorizeLocation = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const locationId = req.params.id || req.body.id;
      const userId = req.user.id;

      if (!locationId) {
        return next(
          new ApiError(
            400,
            "[MIDDLEWARE] Location ID must be provided in URL parameters or request body.",
          ),
        );
      }

      const location = await locationGetDao(locationId);
      if (!location) {
        return next(new ApiError(404, "[MIDDLEWARE] Location not found."));
      }

      let userRole = null;

      if (location.owner_id.toString() === userId) {
        userRole = "Owner";
      } else if (location.members.some((m) => m.toString() === userId)) {
        userRole = "Member";
      }

      if (!userRole || !allowedRoles.includes(userRole)) {
        return next(
          new ApiError(
            403,
            `[MIDDLEWARE] Insufficient privileges. Required: ${allowedRoles.join(" or ")}`,
          ),
        );
      }

      req.locationRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};
export default authorizeLocation;

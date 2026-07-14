import ApiError from "../../utils/api-error.js";
import locationGetDao from "../../dao/location/location-get-dao.js";

// resolveResourceLocationId, when provided, looks up which location the URL's
// actual resource (device/room/message) belongs to, derived from the
// database - never from anything the client supplies. If it doesn't match
// the claimed locationId, the request is rejected even if the caller has
// real privileges on the location they claimed.
const authorizeLocation = (allowedRoles, resolveResourceLocationId) => {
  return async (req, res, next) => {
    try {
      // Extract locationId from URL params, headers, body, or query
      const locationId =
        req.params.locationId ||
        req.headers["x-location-id"] ||
        req.body.locationId ||
        req.query.locationId;

      const userId = req.user.id;

      if (!locationId) {
        return next(
          new ApiError(
            400,
            "[MIDDLEWARE] Location ID missing. Provide it in URL, Headers (x-location-id), or Body.",
          ),
        );
      }

      const location = await locationGetDao(locationId);
      if (!location) {
        return next(new ApiError(404, "[MIDDLEWARE] Location not found."));
      }

      let userRole = null;

      if (location.owner.toString() === userId) {
        userRole = "Owner";
      } else if (
        location.members &&
        location.members.some((m) => m.toString() === userId)
      ) {
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

      if (resolveResourceLocationId) {
        const actualLocationId = await resolveResourceLocationId(req);
        if (!actualLocationId || actualLocationId.toString() !== locationId.toString()) {
          return next(
            new ApiError(403, "[MIDDLEWARE] Resource does not belong to the specified location."),
          );
        }
      }

      req.locationId = locationId;
      req.locationRole = userRole;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorizeLocation;

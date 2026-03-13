import Room from "../../models/room-model.js";
import Location from "../../models/location-model.js";
import ApiError from "../../utils/api-error.js";

const authorizeRoom = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Získáme roomId z parametrů URL (:id nebo :roomId)
      const roomId = req.params.id || req.params.roomId;
      const userId = req.user.id;

      if (!roomId) {
        return next(new ApiError(400, "Room ID je vyžadováno."));
      }

      // 2. Najdeme místnost v databázi
      const room = await Room.findById(roomId);
      if (!room) {
        return next(new ApiError(404, "Místnost nebyla nalezena."));
      }

      // 3. Teď musíme zjistit roli uživatele v lokaci, ke které místnost patří
      // Room musí mít referenci na svou lokaci (např. room.location_id)
      const location = await Location.findById(room.location_id);

      if (!location) {
        return next(
          new ApiError(404, "Lokace přidružená k této místnosti neexistuje."),
        );
      }

      // 4. Určení role v rámci lokace
      let userRole = null;
      if (location.owner_id.toString() === userId) {
        userRole = "Owner";
      } else if (
        location.authorized_users.some((id) => id.toString() === userId)
      ) {
        userRole = "Member";
      }

      // 5. Kontrola práv
      if (!userRole || !allowedRoles.includes(userRole)) {
        return next(
          new ApiError(403, `Nemáte právo přistupovat k této místnosti.`),
        );
      }

      // 6. Uložíme si nalezenou místnost do requestu (volitelné)
      // Controller ji pak nemusí znovu hledat v DB
      req.room = room;
      req.locationRole = userRole;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorizeRoom;

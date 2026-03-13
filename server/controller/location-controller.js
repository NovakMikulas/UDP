import locationCreateAbl from "../abl/location/location-create-abl.js";
import locationDeleteAbl from "../abl/location/location-delete-abl.js";
import locationGetAbl from "../abl/location/location-get-abl.js";
import locationUpdateAbl from "../abl/location/location-update-abl.js";
import locationListAbl from "../abl/location/location-list-abl.js";
export const locationController = {
  create: async (req, res, next) => {
    try {
      const data = {
        ...req.body,
        owner_id: req.user.id,
      };
      await locationCreateAbl(data);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      await locationDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const id = req.params.id;
      const location = await locationGetAbl(id);
      res.status(200).json({ status: "success", data: location });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const updatedLocation = req.body;
      const data = {
        ...updatedLocation,
        id: req.params.id,
      };
      await locationUpdateAbl(data);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const user_id = req.user.id;
      const locations = await locationListAbl(user_id);
      res.status(200).json({ status: "success", data: locations });
    } catch (error) {
      next(error);
    }
  },
};

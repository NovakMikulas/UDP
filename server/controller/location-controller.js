import locationCreateAbl from "../abl/location/location-create-abl.js";
import locationDeleteAbl from "../abl/location/location-delete-abl.js";
import locationGetAbl from "../abl/location/location-get-abl.js";
import locationUpdateAbl from "../abl/location/location-update-abl.js";

export const locationController = {
  create: async (req, res, next) => {
    try {
      const newLocation = req.body;
      await locationCreateAbl(newLocation);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.body.id;
      await locationDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const id = req.params.id;
      await locationGetAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const updatedLocation = req.body;
      await locationUpdateAbl(updatedLocation);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
};

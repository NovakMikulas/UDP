import locationCreateAbl from "../abl/location/location-create-abl.js";
import locationDeleteAbl from "../abl/location/location-delete-abl.js";
import locationGetAbl from "../abl/location/location-get-abl.js";
import locationUpdateAbl from "../abl/location/location-update-abl.js";

export const locationController = {
  create: async (request, reply) => {
    try {
      const newLocation = request.body;
      await locationCreateAbl(newLocation);
    } catch (error) {
      next(error);
    }
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await locationDeleteAbl(id);
    } catch (error) {
      next(error);
    }
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await locationGetAbl(id);
    } catch (error) {
      next(error);
    }
  },
  update: async (request, reply) => {
    try {
      const updatedLocation = request.body;
      await locationUpdateAbl(updatedLocation);
    } catch (error) {
      next(error);
    }
  },
};

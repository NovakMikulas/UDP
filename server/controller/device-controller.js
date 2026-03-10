import { deviceCreateAbl } from "../abl/device/device-create-abl.js";
import { deviceDeleteAbl } from "../abl/device/device-delete-abl.js";
import { deviceGetAbl } from "../abl/device/device-get-abl.js";
import { deviceUpdateAbl } from "../abl/device/device-update-abl.js";

export const deviceController = {
  create: async (request, reply) => {
    try {
      const reqParam = request.body;
      await deviceCreateAbl();
    } catch (error) {}
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await deviceDeleteAbl();
    } catch (error) {}
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await deviceGetAbl();
    } catch (error) {}
  },
  update: async (request, reply) => {
    try {
      const updatedDevice = request.body;
      await deviceUpdateAbl();
    } catch (error) {}
  },
};

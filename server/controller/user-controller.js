import { userCreateAbl } from "../abl/user/user-create-abl.js";
import { userDeleteAbl } from "../abl/user/user-delete-abl.js";
import { userGetAbl } from "../abl/user/user-get-abl.js";
import { userUpdateAbl } from "../abl/user/user-update-abl.js";

export const userController = {
  create: async (request, reply) => {
    try {
      const reqParam = request.body;
      await userCreateAbl();
    } catch (error) {}
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await userDeleteAbl();
    } catch (error) {}
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await userGetAbl();
    } catch (error) {}
  },
  update: async (request, reply) => {
    try {
      const updatedUser = request.body;
      await userUpdateAbl();
    } catch (error) {}
  },
};

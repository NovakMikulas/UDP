import userLoginAbl from "../abl/user/user-login-abl.js";
import userRegisterAbl from "../abl/user/user-register-abl.js";


export const userController = {
  login: async (req, res, next) => {
    try {
      const credentials = req.body;
      const result = await userLoginAbl(credentials);
      res.status(201).json({ status: "success", token: result.token });
    } catch (error) {
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const newUser = req.body;
      await userRegisterAbl(newUser);
      res.status(200).json({ status: "success", message: "user registered successfully" });
    } catch (error) {
      next(error);
    }
  },

};

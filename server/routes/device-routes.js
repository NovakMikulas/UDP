import { deviceController } from "../controller/device-controller.js";

const router = express.Router();

router.post("/create", deviceController.create);

//router.get("/list", authMiddleware, deviceController.list);

router.get("/get/:id", deviceController.get);

router.put("/update/:id", deviceController.update);

router.delete("/delete/:id", deviceController.delete);

export default router;

import { locationController } from "../controller/location-controller.js";

const router = express.Router();

router.post("/create", locationController.create);

//router.get("/list", authMiddleware, locationController.list);

router.get("/get/:id", locationController.get);

router.put("/update/:id", locationController.update);

router.delete("/delete/:id", locationController.delete);

export default router;

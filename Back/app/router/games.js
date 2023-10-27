import { express } from "express";
import { gamesController } from "../controllers";

const router = express.Router();

router.get("/", gamesController.getAllGames);
router.get("/:id", gamesController.getOneGame);

router.post("/", gamesController.addGame);

router.patch("/:id", gamesController.updateGame);

router.delete("/:id", gamesController.deleteGame);

modules.exports = router;

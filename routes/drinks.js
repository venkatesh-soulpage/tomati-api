var express = require("express");
var router = express.Router();
import DrinksController from "../controllers/drinks";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

router.post("/create-drink", VerifyToken, DrinksController.createDrink);
router.get("/", DrinksController.getDrinks);
router.delete("/:drink_id", VerifyToken, DrinksController.deleteDrink);

router.put("/:drink_id", VerifyToken, DrinksController.updateDrink);
module.exports = router;

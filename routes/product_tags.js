var express = require("express");
var router = express.Router();
import productTagsController from "../controllers/product_tags";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

router.post("/create-tag", VerifyToken, productTagsController.createproductTag);
router.get("/", productTagsController.getProductTags);
router.delete("/:tag_id", VerifyToken, productTagsController.deleteProductTag);

router.put("/:tag_id", VerifyToken, productTagsController.updateProductTag);
module.exports = router;

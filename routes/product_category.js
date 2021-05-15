var express = require("express");
var router = express.Router();
import productCategoryController from "../controllers/product_category";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

router.post(
  "/create-category",
  VerifyToken,
  productCategoryController.createproductCategory
);
router.get("/", productCategoryController.getProductCategories);
router.delete(
  "/:category_id",
  VerifyToken,
  productCategoryController.deleteProductCategory
);

router.put(
  "/:category_id",
  VerifyToken,
  productCategoryController.updateProductCategory
);
module.exports = router;

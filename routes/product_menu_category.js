var express = require("express");
var router = express.Router();
import productMenuCategoryController from "../controllers/product_menu_category";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

router.post(
  "/create-menu-category",
  VerifyToken,
  productMenuCategoryController.createproductMenuCategory
);
router.get("/", productMenuCategoryController.getProductMenuCategories);
router.delete(
  "/:menu_category_id",
  VerifyToken,
  productMenuCategoryController.deleteProductMenuCategory
);

router.put(
  "/:menu_category_id",
  VerifyToken,
  productMenuCategoryController.updateProductMenuCategory
);
module.exports = router;

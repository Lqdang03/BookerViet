const router = require("express").Router();
const categoryController = require("../controllers/CategoryController");

router.get("/", categoryController.getAllCategories);


module.exports = router;
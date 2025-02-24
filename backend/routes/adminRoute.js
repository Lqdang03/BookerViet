const express = require("express");
const { checkAuthorize } = require("../middleware/authMiddleware");
const adminController = require("../controllers/AdminController");
const adminBookController = require("../controllers/AdminBookController");

const router = express.Router();

// ✅ Quản lý user
router.get("/users", checkAuthorize(["admin"]), adminController.getAllUsers);
router.get("/users/:id", checkAuthorize(["admin"]), adminController.getUserById);
router.put("/users/:id", checkAuthorize(["admin"]), adminController.updateUser);
router.delete("/users/:id", checkAuthorize(["admin"]), adminController.deleteUser);
router.get("/users/:id/orders", checkAuthorize(["admin"]), adminController.getUserOrders);

// ✅ Quản lý đơn hàng
router.get("/orders", checkAuthorize(["admin"]), adminController.getAllOrders);
router.put("/orders/:id", checkAuthorize(["admin"]), adminController.updateOrderStatus);


router.get("/books", checkAuthorize(["admin"]), adminBookController.getAllBooks);
router.get("/books/:id", checkAuthorize(["admin"]), adminBookController.getBookById);
router.post("/books", checkAuthorize(["admin"]), adminBookController.createBook);
router.put("/books/:id", checkAuthorize(["admin"]), adminBookController.updateBook);
router.delete("/books/:id", checkAuthorize(["admin"]), adminBookController.deleteBook);

router.get("/categories", checkAuthorize(["admin"]), adminBookController.getAllCategories);
router.post("/categories", checkAuthorize(["admin"]), adminBookController.createCategory);
router.put("/categories/:id", checkAuthorize(["admin"]), adminBookController.updateCategory);
router.delete("/categories/:id", checkAuthorize(["admin"]), adminBookController.deleteCategory);

module.exports = router;

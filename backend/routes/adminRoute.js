const express = require("express");
const { checkAuthorize } = require("../middleware/authMiddleware");
const adminController = require("../controllers/AdminController");

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

module.exports = router;

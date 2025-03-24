const express = require("express");
const { checkAuthorize } = require("../middleware/authMiddleware");
const adminController = require("../controllers/AdminController");
const adminBookController = require("../controllers/AdminBookController");
const {updateBoxInfo} = require("../controllers/OrderController");
const {confirmOrder} = require("../controllers/GhnController");
const adminReviewController = require("../controllers/AdminReviewController");
const complaintController = require("../controllers/ComplaintController");
const discountController = require("../controllers/DiscountController");
const adminDashboardController = require("../controllers/AdminDashBoardController");
const {changeStatusUser} = require("../controllers/UserController");

const router = express.Router();

// ✅ Quản lý user
router.get("/users", checkAuthorize(["admin"]), adminController.getAllUsers);
router.get("/users/:id", checkAuthorize(["admin"]), adminController.getUserById);
router.put("/users/:id", checkAuthorize(["admin"]), adminController.updateUser);
router.put("/users/:id/change-status", checkAuthorize(["admin"]), changeStatusUser);

// ✅ Quản lý đơn hàng
router.get("/orders", checkAuthorize(["admin"]), adminController.getAllOrders);
router.put("/orders/:id/change-status", checkAuthorize(["admin"]), adminController.updateOrderStatus);
router.post("/orders/update-box-info/:id", checkAuthorize(["admin"]), updateBoxInfo);
router.post("/orders/confirm/:id", checkAuthorize(["admin"]), confirmOrder);


// ✅ Quản lý sách
router.get("/books", checkAuthorize(["admin"]), adminBookController.getAllBooks);
router.get("/books/:id", checkAuthorize(["admin"]), adminBookController.getBookById);
router.post("/books", checkAuthorize(["admin"]), adminBookController.createBook);
router.put("/books/:id", checkAuthorize(["admin"]), adminBookController.updateBook);
router.delete("/books/:id", checkAuthorize(["admin"]), adminBookController.deleteBook);



// ✅ Quản lý danh mục sách
router.get("/categories", checkAuthorize(["admin"]), adminBookController.getAllCategories);
router.post("/categories", checkAuthorize(["admin"]), adminBookController.createCategory);
router.put("/categories/:id", checkAuthorize(["admin"]), adminBookController.updateCategory);
router.delete("/categories/:id", checkAuthorize(["admin"]), adminBookController.deleteCategory);

// ✅ Quản lý mã giảm giá
router.get("/discounts", checkAuthorize(["admin"]), discountController.getAllDiscounts);
router.get("/discounts/:id", checkAuthorize(["admin"]), discountController.getDiscountById);
router.post("/discounts", checkAuthorize(["admin"]), discountController.createDiscount);
router.put("/discounts/:id", checkAuthorize(["admin"]), discountController.updatedDiscount);
router.put("/discounts/:id/change-status", checkAuthorize(["admin"]), discountController.changeStatusDiscount);

// ✅ Quản lý đánh giá và xếp hạng
router.get("/reviews", checkAuthorize(["admin"]), adminReviewController.getAllReviews);
router.delete("/reviews/:reviewId", checkAuthorize(["admin"]), adminReviewController.deleteReview);
router.get("/books/:id/reviews", checkAuthorize(["admin"]), adminReviewController.getReviewsByBook);
router.get("/users/:id/reviews", checkAuthorize(["admin"]), adminReviewController.getReviewsByUser);

// ✅ Quản lý khiếu nại

router.get("/complaints", checkAuthorize(["admin"]), complaintController.getAllComplaints);
router.put("/complaints/:id", checkAuthorize(["admin"]), complaintController.updateComplaintStatus);

// ✅ Quản lý DashBoard
router.get("/dashboard", checkAuthorize(["admin"]), adminDashboardController.getAdminDashboardStats);

module.exports = router;

const router = require("express").Router();
const userController = require("../controllers/UserController");
const {checkAuthorize} = require("../middleware/authMiddleware");

// Lấy danh sách wishlist
router.get("/wishlist", checkAuthorize(["user"]), userController.getMyWishlist);

// Thêm sách vào wishlist
router.post("/wishlist/:bookId", checkAuthorize(["user"]), userController.addBookToWishlist);

// Xóa sách trong wishlist
router.delete("/wishlist/:bookId", checkAuthorize(["user"]), userController.deleteBookFromWishlist);

// Lấy thông tin user
router.get("/profile", checkAuthorize(["user"]), userController.getMyProfile);

// Đổi mật khẩu
router.put("/change-password", checkAuthorize(["user"]), userController.changePassword);

// Lấy danh sách phản ánh
router.get("/complaint", checkAuthorize(["user"]), userController.getMyComplaints);

// Tạo phản ánh
router.post("/complaint", checkAuthorize(["user"]), userController.addComplaint);

// Hủy phản ánh
router.delete("/complaint/:complaintId", checkAuthorize(["user"]), userController.cancelComplaint);

module.exports = router;
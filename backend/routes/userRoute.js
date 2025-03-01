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

module.exports = router;
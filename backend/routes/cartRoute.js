const router = require("express").Router();
const cartController = require("../controllers/CartController");
const {checkAuthorize} = require("../middleware/authMiddleware");


// Lấy giỏ hàng
router.get("/", checkAuthorize(["user"]), cartController.getCart);

// Thêm sách vào giỏ hàng
router.post("/add", checkAuthorize(["user"]), cartController.addBookToCart);

// Cập nhật giỏ hàng
router.put("/update", checkAuthorize(["user"]), cartController.updateCart);

// Xóa sách trong giỏ hàng
router.delete("/remove/:bookId", checkAuthorize(["user"]), cartController.deleteBookFromCart);

module.exports = router;
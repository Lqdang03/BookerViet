const bcrypt = require("bcryptjs");
const Book = require("../models/Book");
const User = require("../models/User");

// wishlist
const addBookToWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = req.user;

    // Kiểm tra sách có tồn tại không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Sách không tồn tại!" });
    }

    // Kiểm tra nếu sách đã có trong wishlist
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: "Sách đã có trong wishlist!" });
    }

    // Thêm sách vào wishlist
    user.wishlist.push(bookId);
    await user.save();

    res
      .status(200)
      .json({ message: "Đã thêm sách vào wishlist!", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteBookFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = req.user;

    // Kiểm tra nếu sách không có trong wishlist
    if (!user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: "Sách không có trong wishlist!" });
    }

    // Loại bỏ sách khỏi wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
    await user.save();

    res
      .status(200)
      .json({ message: "Đã xóa sách khỏi wishlist!", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const getMyWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// profile

const getMyProfile = async (req, res) => {
  try {
    const user = req?.user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// change password

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if(newPassword.length < 6)
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
    if(oldPassword === newPassword)
      return res.status(400).json({ message: "Mật khẩu mới trùng với mật khẩu cũ!" });

    const user = req.user;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Mật khẩu đã đổi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const userController = {
  addBookToWishlist,
  deleteBookFromWishlist,
  getMyWishlist,
  getMyProfile,
  changePassword,
};
module.exports = userController;

const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');

// Hàm tính toán average rating
const getAverageRating = async (bookId) => {
    const reviews = await Review.find({ book: bookId });

    if (reviews.length === 0) {
        return 0; // Nếu không có đánh giá, trả về 0
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;  // Tính trung bình rating
};

// Tạo một đánh giá mới
const createReview = async (req, res) => {
    try {
        const { bookId } = req.params;  // Lấy bookId từ params
        const { rating, comment } = req.body;  // Lấy rating và comment từ body

        // Kiểm tra nếu sách tồn tại
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Kiểm tra nếu người dùng đã đánh giá cuốn sách này
        const existingReview = await Review.findOne({ book: bookId, user: req.user._id });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this book" });
        }

        // Tạo mới review
        const review = new Review({
            book: bookId,
            user: req.user._id,
            rating,
            comment
        });

        await review.save();

        // Tính toán average rating mới cho sách
        const averageRating = await getAverageRating(bookId);

        return res.status(201).json({ message: "Review added successfully", review, averageRating });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách đánh giá của một cuốn sách
const getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        // Kiểm tra nếu sách tồn tại
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Lấy tất cả đánh giá của cuốn sách
        const reviews = await Review.find({ book: bookId }).populate('user', 'name');

        // Tính toán average rating của sách
        const averageRating = await getAverageRating(bookId);

        return res.status(200).json({ reviews, averageRating });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getUserReview = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user._id; // Lấy userId từ thông tin người dùng trong req.user

        // Tìm đánh giá của người dùng cho sách này
        const review = await Review.findOne({ book: bookId, user: userId });

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá của người dùng này" });
        }

        return res.status(200).json(review);
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá của người dùng:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// Cập nhật đánh giá của người dùng
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // Tìm review theo reviewId
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Kiểm tra xem người dùng có phải là người đã tạo review này không
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }

        // Cập nhật review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await review.save();

        // Tính toán lại average rating sau khi cập nhật
        const averageRating = await getAverageRating(review.book);

        return res.status(200).json({ message: "Review updated successfully", review, averageRating });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Xóa một đánh giá
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Tìm review theo reviewId
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Kiểm tra xem người dùng có phải là người đã tạo review này không
        if (!req.user || review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        // Lưu lại bookId để tính lại average rating sau khi xóa
        const bookId = review.book;

        // Xóa review (sử dụng findByIdAndDelete để đảm bảo tính tương thích)
        await Review.findByIdAndDelete(reviewId);

        // Tính toán lại average rating sau khi xóa
        const averageRating = await getAverageRating(bookId);

        return res.status(200).json({ message: "Review deleted successfully", averageRating });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createReview,
    getReviewsByBook,
    getUserReview,
    updateReview,
    deleteReview
};

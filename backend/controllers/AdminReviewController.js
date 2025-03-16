const Review = require("../models/Review");

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("book", "title") // Lấy tiêu đề sách
            .populate("user", "name")  // Lấy tên user
            .sort({ createdAt: -1 });  // Sắp xếp theo thời gian mới nhất

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách review", error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy review" });
        }

        await review.deleteOne();
        res.status(200).json({ message: "Review đã được xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa review", error: error.message });
    }
};
exports.getReviewsByBook = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ book: id })
            .populate("book", "title") // Lấy tiêu đề sách
            .populate("user", "name")  // Lấy tên user
            .sort({ createdAt: -1 });  // Sắp xếp theo thời gian mới nhất

        if (reviews.length === 0) {
            return res.status(404).json({ message: "Không có review cho sách này" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy reviews cho sách", error: error.message });
    }
};

exports.getReviewsByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ user: id })
            .populate("book", "title") // Lấy tiêu đề sách
            .populate("user", "name")  // Lấy tên user
            .sort({ createdAt: -1 });  // Sắp xếp theo thời gian mới nhất

        if (reviews.length === 0) {
            return res.status(404).json({ message: "Không có review cho người dùng này" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy reviews cho người dùng", error: error.message });
    }
};


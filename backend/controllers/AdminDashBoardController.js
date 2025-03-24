const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

const getAdminDashboardStats = async (req, res) => {
    try {
        // Thống kê trạng thái đơn hàng (group by orderStatus)
        const orderStatusCount = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        // Thống kê tổng sách và tổng người dùng
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();

        // Trả về dữ liệu thống kê
        return res.status(200).json({
            orderStatusCount,
            totalBooks,
            totalUsers
        });
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getAdminDashboardStats };

const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

const getAdminDashboardStats = async (req, res) => {
    try {
        // Thống kê trạng thái đơn hàng (group by orderStatus)
        const orderStatusCount = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        // Mapping trạng thái đơn hàng sang tiếng Việt
        const statusMapping = {
            "Pending": "Chờ xác nhận",
            "Processing": "Đã xác nhận",
            "Cancelled": "Đã hủy"
        };

        // Chuyển đổi trạng thái đơn hàng
        const formattedOrderStatus = orderStatusCount.map(item => ({
            status: statusMapping[item._id] || item._id,
            count: item.count
        }));

        // Thống kê sách và người dùng
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();

        return res.status(200).json({
            totalBooks,
            totalUsers,
            orderStatusCount: formattedOrderStatus
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

module.exports = { getAdminDashboardStats };

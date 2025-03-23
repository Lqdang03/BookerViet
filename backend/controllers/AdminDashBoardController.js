const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

const getAdminDashboardStats = async (req, res) => {
    try {
        // Thống kê đơn hàng
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        
        // Thống kê trạng thái đơn hàng (group by orderStatus)
        const orderStatusCount = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);
        
        // Thống kê phương thức thanh toán (group by paymentMethod)
        const paymentMethodCount = await Order.aggregate([
            { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
        ]);

        // Thống kê sách và người dùng
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();

        // Trả về dữ liệu thống kê dưới dạng JSON
        return res.status(200).json({
            totalOrders,
            pendingOrders,
            completedOrders,
            orderStatusCount,
            paymentMethodCount,
            totalBooks,
            totalUsers
        });
    } catch (error) {
        // Xử lý lỗi và trả về thông báo lỗi chi tiết
        console.error("Error fetching admin dashboard stats:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getAdminDashboardStats };

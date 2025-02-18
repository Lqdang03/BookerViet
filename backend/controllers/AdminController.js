const User = require("../models/User");
const Order = require("../models/Order");

// 1️⃣ Admin lấy danh sách user
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách user", error });
    }
};

// 2️⃣ Admin xem thông tin user theo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User không tồn tại" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy thông tin user", error });
    }
};

// 3️⃣ Admin cập nhật user
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
        if (!updatedUser) return res.status(404).json({ message: "User không tồn tại" });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật user", error });
    }
};

// 4️⃣ Admin xóa user
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User không tồn tại" });
        res.status(200).json({ message: "Xóa user thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa user", error });
    }
};

// 5️⃣ Admin xem lịch sử đơn hàng & điểm tích lũy của user
exports.getUserOrders = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name email point");
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        const orders = await Order.find({ user: req.params.id }).populate("items.book", "title price");
        res.status(200).json({ user, orders });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy lịch sử đơn hàng", error });
    }
};

// 6️⃣ Admin lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("items.book", "title price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error });
    }
};

// 7️⃣ Admin cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái đơn hàng", error });
    }
};

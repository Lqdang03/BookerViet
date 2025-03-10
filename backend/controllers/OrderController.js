const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const createOrder = async (req, res) => {
    try {

        const cart = await Cart.findOne({ user: req.user.id });
        const items = cart.cartItems;

        const { shippingInfo, paymentMethod, totalDiscount, pointUsed } = req.body;
        const userId = req.user.id; // Lấy user từ token

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không được để trống!' });
        }

        // Tính tổng giá trị đơn hàng
        let totalAmount = 0;
        for (const item of items) {
            const book = await Book.findById(item.book);
            if (!book) {
                return res.status(404).json({ message: `Sách ID ${item.book} không tồn tại!` });
            }
            if (book.stock < item.quantity) {
                return res.status(400).json({ message: `Sách "${book.title}" không đủ hàng!` });
            }
            totalAmount += book.price * item.quantity;
        }

        // Áp dụng giảm giá
        totalAmount -= totalDiscount + pointUsed;

        const newOrder = new Order({
            user: userId,
            items,
            shippingInfo,
            paymentMethod,
            totalDiscount,
            pointUsed,
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({
            data: savedOrder,
            totalAmount});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const orderController = {createOrder};
module.exports = orderController;
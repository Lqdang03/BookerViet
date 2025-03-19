const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const createOrder = async (req, res) => {
    try {

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không được để trống!' });
        }

        const items = [];

        const { shippingInfo, paymentMethod, totalDiscount, pointUsed } = req.body;
        const userId = req.user.id; // Lấy user từ token

        // Tính tổng giá trị đơn hàng
        let totalAmount = 0;
        for (const item of cart.cartItems) {
            const book = await Book.findById(item.book);
            if (!book) {
                return res.status(404).json({ message: `Sách ID ${item.book} không tồn tại!` });
            }
            if (book.stock < item.quantity) {
                return res.status(400).json({ message: `Sách "${book.title}" không đủ hàng!` });
            }
            totalAmount += book.price * item.quantity;

            items.push({
                book: book._id,
                quantity: item.quantity,
                price: book.price
            });
        }

        // Áp dụng giảm giá
        totalAmount -= totalDiscount + pointUsed;

        if(paymentMethod === 'COD' && totalAmount > 500000){
            res.status(400).json({message: 'Đơn vượt quá giá trị cho phép'});
        }

        const newOrder = new Order({
            user: userId,
            items,
            shippingInfo,
            paymentMethod,
            totalDiscount,
            pointUsed,
            paymentStatus: paymentMethod === 'COD' ? 'Completed' : 'Pending',
            orderStatus: 'Pending',
        });

        
        const savedOrder = await newOrder.save();
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { cartItems: [] } }, // Xóa toàn bộ cartItems nhưng giữ cart
            { new: true }
        );
        res.status(201).json({ data: savedOrder, totalAmount});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateBoxInfo = async (req, res) => {
    try {
        const { boxInfo } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.boxInfo = boxInfo;
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOrderDetails = async (req, res) => {
    const orderId = req.params.id;
    const user = req.user;
    try {
        const order = await Order.findById(orderId).populate('items.book', 'title');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log('INFO order');
        console.log(order);
        console.log('INFO user');
        console.log(user);

        if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const orderController = {createOrder, updateBoxInfo, getMyOrders, getOrderDetails};
module.exports = orderController;
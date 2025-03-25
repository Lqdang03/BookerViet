const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAdminDashboardStats = async (req, res) => {
    try {
        // Existing order status count
        const orderStatusCount = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        const statusMapping = {
            "Pending": "Chờ xác nhận",
            "Processing": "Đã xác nhận",
            "Cancelled": "Đã hủy"
        };

        const formattedOrderStatus = orderStatusCount.map(item => ({
            status: statusMapping[item._id] || item._id,
            count: item.count
        }));

        // Top 10 best-selling products
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.book",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: "$bookDetails" },
            {
                $project: {
                    bookId: "$_id",
                    bookName: "$bookDetails.title",
                    totalQuantity: 1,
                    totalRevenue: 1,
                    bookImages: "$bookDetails.images" // Add images to the projection
                }
            }
        ]);

        // Total Revenue Calculation
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'Completed' } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "discounts",
                    localField: "discountUsed",
                    foreignField: "_id",
                    as: "discount"
                }
            },
            {
                $addFields: {
                    discountValue: { $ifNull: [{ $arrayElemAt: ["$discount.value", 0] }, 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $subtract: [
                                {
                                    $add: [
                                        { $multiply: ["$items.quantity", "$items.price"] },
                                        "$shippingInfo.fee"
                                    ]
                                },
                                "$discountValue"
                            ]
                        }
                    }
                }
            }
        ]);



        // Detailed Revenue Analysis
        const revenueAnalysis = await Order.aggregate([
            { $match: { paymentStatus: 'Completed' } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "discounts",
                    localField: "discountUsed",
                    foreignField: "_id",
                    as: "discount"
                }
            },
            {
                $addFields: {
                    itemRevenue: { $multiply: ["$items.quantity", "$items.price"] },
                    date: "$createdAt",
                    discountValue: { $ifNull: [{ $arrayElemAt: ["$discount.value", 0] }, 0] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        week: { $week: "$date" },
                        day: { $dayOfMonth: "$date" }
                    },
                    originalRevenue: { $sum: "$itemRevenue" },
                    shippingRevenue: { $sum: "$shippingInfo.fee" },
                    discountTotal: { $sum: "$discountValue" },
                    netRevenue: {
                        $sum: {
                            $subtract: [
                                { $add: ["$itemRevenue", "$shippingInfo.fee"] },
                                "$discountValue"
                            ]
                        }
                    },
                    itemCount: { $sum: "$items.quantity" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 1,
                    originalRevenue: { $round: ["$originalRevenue", 2] },
                    shippingRevenue: { $round: ["$shippingRevenue", 2] },
                    discountTotal: { $round: ["$discountTotal", 2] },
                    netRevenue: { $round: ["$netRevenue", 2] },
                    itemCount: 1,
                    orderCount: 1,
                    averageOrderValue: { $round: [{ $divide: ["$netRevenue", "$orderCount"] }, 2] }
                }
            },
            {
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1,
                    "_id.week": -1,
                    "_id.day": -1
                }
            },
            { $limit: 50 }
        ]);

        // Total statistics
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();

        return res.status(200).json({
            totalBooks,
            totalUsers,
            totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
            orderStatusCount: formattedOrderStatus,
            topSellingProducts,
            revenueAnalysis
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

module.exports = { getAdminDashboardStats };
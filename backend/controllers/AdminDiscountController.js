const Discount = require("../models/Discount");

const validateDiscountData = (data) => {
    const errors = [];

    // Kiểm tra mã giảm giá (code)
    if (!data.code || data.code.trim().length === 0) {
        errors.push("Discount code is required.");
    }

    // Kiểm tra kiểu giảm giá (type)
    if (!data.type || !['fixed', 'percentage'].includes(data.type)) {
        errors.push("Discount type must be 'fixed' or 'percentage'.");
    }

    // Kiểm tra giá trị giảm giá (value)
    if (data.value == null || data.value <= 0) {
        errors.push("Discount value must be a positive number.");
    }

    // Kiểm tra giá trị mua tối thiểu (minPurchase)
    if (data.minPurchase == null || data.minPurchase < 0) {
        errors.push("Minimum purchase must be a non-negative number.");
    }

    // Kiểm tra giới hạn sử dụng (usageLimit)
    if (data.usageLimit == null || data.usageLimit < 1) {
        errors.push("Usage limit must be at least 1.");
    }

    // Kiểm tra ngày bắt đầu và kết thúc (startDate, endDate)
    if (!data.startDate || !data.endDate || new Date(data.startDate) >= new Date(data.endDate)) {
        errors.push("Start date must be before end date.");
    }

    return errors;
};

const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find();
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) return res.status(404).json({ message: "Discount not found" });
        res.json(discount);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const createDiscount = async (req, res) => {
    const errors = validateDiscountData(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const newDiscount = new Discount(req.body);
        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (error) {
        res.status(400).json({ message: "Invalid data" });
    }
};

const updateDiscount = async (req, res) => {
    const errors = validateDiscountData(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const updatedDiscount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDiscount) return res.status(404).json({ message: "Discount not found" });
        res.json(updatedDiscount);
    } catch (error) {
        res.status(400).json({ message: "Invalid data" });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
        if (!deletedDiscount) return res.status(404).json({ message: "Discount not found" });
        res.json({ message: "Discount deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount
};

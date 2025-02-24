const Book = require("../models/Book");
const Category = require("../models/Category");
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({isActivated: true}).populate("categories");
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const bookController = {getAllBooks};
module.exports = bookController;
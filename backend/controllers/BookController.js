const Book = require("../models/Book");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({isActivated: true});
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy sách", error: error.message });
    }
}

const getBookByCategory = async (req, res) => {
   try {
       const books = await Book.find({categories: req.params.id});
       res.status(200).json(books);
   } catch (error) {
       res.status(500).json({ message: "Lỗi server!", error: error.message });
   }
};
const bookController = {getAllBooks, getBookById, getBookByCategory};
module.exports = bookController;
const router = require("express").Router();
const bookController = require("../controllers/BookController");

router.get("/", bookController.getAllBooks);

module.exports = router;
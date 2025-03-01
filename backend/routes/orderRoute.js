const router = require("express").Router();
const orderController = require('../controllers/OrderController');
const {checkAuthorize} = require("../middleware/authMiddleware");

router.post('/create', checkAuthorize(['user']), orderController.createOrder);

module.exports = router;
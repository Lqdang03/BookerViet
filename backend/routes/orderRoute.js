const router = require("express").Router();
const orderController = require('../controllers/OrderController');
const {confirmOrder} = require("../controllers/GhnController");
const {checkAuthorize} = require("../middleware/authMiddleware");

router.post('/create', checkAuthorize(['user']), orderController.createOrder);
router.post('/update-box-info/:id', checkAuthorize(['admin']), orderController.updateBoxInfo);
router.post('/confirm/:id', checkAuthorize(['admin']), confirmOrder);

module.exports = router;
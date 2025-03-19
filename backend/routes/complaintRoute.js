const router = require("express").Router();
const {checkAuthorize} = require("../middleware/authMiddleware");
const complaintController = require("../controllers/ComplaintController");

router.get("/", checkAuthorize(["user"]), complaintController.getAllComplaints);



module.exports = router;
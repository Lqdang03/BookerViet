const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const VNP_TMNCODE = process.env.VNP_TMNCODE;
const VNP_HASHSECRET = process.env.VNP_HASHSECRET;
const VNP_URL = process.env.VNP_URL;
const VNP_RETURNURL = process.env.VNP_RETURNURL;
const Order = require("../models/Order");
const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("items.book","title price");

    if (!order) {
      return res.status(404).json({ message: `Order ${orderId} không tồn tại` });
    }

    let amount = 0 ;
    for(const item of order.items){
        amount += item.price * item.quantity;
    }

    amount += order?.shippingInfo?.fee;

    amount -= order.totalDiscount + order.pointUsed;

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMNCODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: moment().format("YYYYMMDDHHmmss"),
      vnp_OrderInfo: orderId,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100, // Convert VND to VNPAY format
      vnp_ReturnUrl: VNP_RETURNURL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    vnp_Params = sortObject(vnp_Params);

    // 🔑 Tạo signature (Chữ ký bảo mật)
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // 🔗 Tạo link thanh toán
    const paymentUrl = `${VNP_URL}?${qs.stringify(vnp_Params, {
      encode: false,
    })}`;
    return res.status(200).json({ paymentUrl });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const getPaymentReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    const orderId = vnp_Params["vnp_OrderInfo"];
    
    // Add await here
    const order = await Order.findById(orderId);
    if(!order){
      return res.status(404).json({ message: `Order ${orderId} không tồn tại` });
    }

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    // 📌 Kiểm tra chữ ký
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        // Update order first
        order.paymentStatus = "Completed";
        await order.save();
        
        // Then send response
        return res.status(200).json({ message: "Thanh toán thành công!", status: "success" });
      } else {
        return res.status(400).json({ message: "Thanh toán thất bại!", status: "fail" });
      }
    } else {
      return res.status(400).json({ message: "Sai chữ ký bảo mật!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
  

const paymentController = { createPayment, getPaymentReturn};
module.exports = paymentController;

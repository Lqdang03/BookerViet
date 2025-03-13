require("dotenv").config();
const axios = require("axios");
const Order = require("../models/Order");
const Book = require("../models/Book");
const {
  GHN_API_URL,
  GHN_TOKEN,
  GHN_SHOP_ID,
  GHN_SERVICE_TYPE_NHE,
} = process.env;
const getProvince = async (req, res) => {
  try {
    const response = await axios.get(`${GHN_API_URL}/master-data/province`, {
      headers: {
        Token: GHN_TOKEN,
      },
    });
    const dataResponse = response.data;
    const provinces = dataResponse?.data.map((province) => ({
      ProvinceID: province.ProvinceID,
      ProvinceName: province.ProvinceName,
      Code: province.Code,
      NameExtension: province.NameExtension,
    }));
    res.json(provinces);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
};

const getDistrict = async (req, res) => {
  try {
    const response = await axios.get(`${GHN_API_URL}/master-data/district`, {
      headers: {
        Token: GHN_TOKEN,
      },
      params: {
        province_id: req.query.provinceID,
      },
    });
    const dataResponse = response.data;
    const districts = dataResponse?.data.map((district) => ({
      DistrictID: district.DistrictID,
      DistrictName: district.DistrictName,
      ProvinceID: district.ProvinceID,
      Code: district.Code,
      NameExtension: district.NameExtension,
    }));
    res.json(districts);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
};

const getWard = async (req, res) => {
  try {
    const response = await axios.get(`${GHN_API_URL}/master-data/ward`, {
      headers: {
        Token: GHN_TOKEN,
      },
      params: {
        district_id: req.query.districtID,
      },
    });
    const dataResponse = response.data;
    const wards = dataResponse?.data.map((ward) => ({
      WardCode: ward.WardCode,
      WardName: ward.WardName,
      DistrictID: ward.DistrictID,
      NameExtension: ward.NameExtension,
    }));
    res.json(wards);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
};

const calculateFee = async (req, res) => {
  try {
    const { to_ward_code, to_district_id, insurance_value, weight } = req.query; // Dùng query thay vì body

    if (!to_ward_code || !to_district_id || !insurance_value || !weight) {
      return res.status(400).json({ message: "Thiếu thông tin tính phí vận chuyển" });
    }

    const response = await axios.get(`${GHN_API_URL}/v2/shipping-order/fee`, {
      headers: {
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID,
      },
      params: {
        service_type_id: GHN_SERVICE_TYPE_NHE,
        to_ward_code,
        to_district_id,
        weight,
        insurance_value,
      },
    });

    if (!response.data || !response.data.data) {
      return res.status(400).json({ message: "Không nhận được dữ liệu phí vận chuyển" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("GHN Fee Calculation Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi khi tính phí vận chuyển" });
  }
};


const confirmOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.boxInfo === null) {
      return res
        .status(400)
        .json({
          message: "Vui lòng nhập thông tin (weight, length, width, height)",
        });
    }

    let totalValue = 0;
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res
          .status(404)
          .json({ message: `Sách ID ${item.book} không tồn tại!` });
      }
      if (book.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Sách "${book.title}" không đủ hàng!` });
      }
      totalValue += book.price * item.quantity;
    }
    totalValue += order?.shippingInfo?.fee;

    const response = await axios.post(
      `${GHN_API_URL}/v2/shipping-order/create`,
      {
        payment_type_id: order?.paymentMethod === "COD" ? 2 : 1,
        note: order?.shippingInfo?.note,
        required_note: "KHONGCHOXEMHANG",
        to_name: order?.shippingInfo?.name,
        to_phone: order?.shippingInfo?.phoneNumber,
        to_address: order?.shippingInfo?.address,
        to_province_name: order?.shippingInfo?.provineName,
        to_district_name: order?.shippingInfo?.districtName,
        to_ward_name: order?.shippingInfo?.wardName,
        content: order?._id,
        cod_amount: order?.paymentMethod === "COD" ? totalValue : 0,
        weight: order?.boxInfo?.weight,
        length: order?.boxInfo?.length,
        width: order?.boxInfo?.width,
        height: order?.boxInfo?.height,
        cod_failed_amount: totalValue,
        insurance_value: totalValue,
        service_type_id: 2,
      },
      {
        headers: {
          Token: GHN_TOKEN,
          ShopId: GHN_SHOP_ID,
        },
      }
    );

    const dataResponse = response.data;
    if (dataResponse?.code === 200) {
      order.orderStatus = "Processing";
      const orderCode = dataResponse?.data?.order_code;
      order.trackingNumber = orderCode;
      await order.save();
      res
        .status(200)
        .json({ message: "Xác nhận đơn hàng thành công", orderCode });
    } else {
      res.status(400).json({ message: dataResponse?.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.response?.data?.message });
  }
};

const ghnController = {
  getProvince,
  getDistrict,
  getWard,
  calculateFee,
  confirmOrder,
};
module.exports = ghnController;

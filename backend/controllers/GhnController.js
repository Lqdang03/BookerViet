require("dotenv").config();
const axios = require("axios");
const { GHN_API_URL, GHN_TOKEN, GHN_SHOP_ID, GHN_SHOP_DISTRICT, GHN_SERVICE_TYPE_NHE} = process.env;
const getProvince = async (req, res) => {
  try {
    const response = await axios.get(`${GHN_API_URL}/master-data/province`,{
        headers: {
          Token: GHN_TOKEN,
        },
      }
    );
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
                province_id: req.query?.provinceID,
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
                Token: GHN_TOKEN            
            },
            params: {
                district_id: req.query?.districtID,
            },
        });
        const dataResponse = response.data;
        const wards = dataResponse?.data.map((ward) => ({
            WardCode: ward.WardCode,
            WardName: ward.WardName,
            DistrictID: ward.DistrictID,
            NameExtension: ward.NameExtension,
        }))
        res.json(wards);
    } catch (error) {
        res.status(500).json(error?.response?.data);
    }
};

const calculateFee = async (req, res) => {
    console.log("Received request to calculate fee with params:", req.query);

    const { to_ward_code, to_district_id, insurance_value, weight } = req.query; // Dùng req.query vì GET
    if (!to_ward_code || !to_district_id || !insurance_value || !weight) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết để tính phí" });
    }

    try {
        const response = await axios.get(`${GHN_API_URL}/v2/shipping-order/fee`, {
            headers: {
                Token: GHN_TOKEN,
                ShopId: GHN_SHOP_ID,            
            },
            params: {
                from_district_id: GHN_SHOP_DISTRICT, // Cần xác nhận giá trị này
                service_type_id: GHN_SERVICE_TYPE_NHE, // Xác nhận mã dịch vụ
                to_district_id,
                to_ward_code,
                weight,
                insurance_value
            }
        });

        console.log("GHN response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error from GHN API:", error.response?.data || error.message);
        res.status(500).json({ message: "Không thể lấy phí vận chuyển từ GHN", error: error.response?.data });
    }
};


const createOrderOCD = async (req, res) => {
    
};

const ghnController = {
    getProvince,
    getDistrict,
    getWard,
    calculateFee,
};
module.exports = ghnController;

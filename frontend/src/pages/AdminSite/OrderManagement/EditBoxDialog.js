import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField
} from '@mui/material';

const EditBoxDialog = ({ open, order, onClose, onSave }) => {
  // Initialize state
  const [boxInfo, setBoxInfo] = useState({
    weight: "",
    length: "",
    width: "",
    height: ""
  });

  // Initialize validation errors state
  const [errors, setErrors] = useState({
    weight: false,
    length: false,
    width: false,
    height: false
  });

  // Update state when order changes or dialog opens
  useEffect(() => {
    if (order && open) {
      setBoxInfo({
        weight: order.boxInfo?.weight || "",
        length: order.boxInfo?.length || "",
        width: order.boxInfo?.width || "",
        height: order.boxInfo?.height || ""
      });
      setErrors({
        weight: false,
        length: false,
        width: false,
        height: false
      });
    }
  }, [order, open]);

  const validateField = (name, value) => {
    // Check if empty
    if (value === "") return "Không được để trống";
    
    // Convert to number
    const numValue = Number(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) return "Phải là số";
    
    // Check if it's less than 0
    if (numValue < 0) return "Không được nhỏ hơn 0";
    
    // Check if it's an integer
    if (!Number.isInteger(numValue)) return "Phải là số nguyên";
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setBoxInfo({
      ...boxInfo,
      [name]: value
    });
    
    const errorMessage = validateField(name, value);
    setErrors({
      ...errors,
      [name]: errorMessage
    });
  };

  const handleSubmit = () => {
    // Validate all fields before submitting
    const newErrors = {
      weight: validateField("weight", boxInfo.weight),
      length: validateField("length", boxInfo.length),
      width: validateField("width", boxInfo.width),
      height: validateField("height", boxInfo.height)
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      return;
    }
    
    // Convert all values to integers before saving
    const validatedBoxInfo = {
      weight: parseInt(boxInfo.weight, 10),
      length: parseInt(boxInfo.length, 10),
      width: parseInt(boxInfo.width, 10),
      height: parseInt(boxInfo.height, 10)
    };
    
    onSave(validatedBoxInfo);
    onClose();
  };

  const isFormValid = () => {
    return (
      boxInfo.weight !== "" && 
      boxInfo.length !== "" && 
      boxInfo.width !== "" && 
      boxInfo.height !== "" &&
      !errors.weight &&
      !errors.length && 
      !errors.width && 
      !errors.height
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa thông tin đóng gói</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              name="weight"
              label="Cân nặng (g)"
              type="number"
              fullWidth
              value={boxInfo.weight}
              onChange={handleChange}
              error={!!errors.weight}
              helperText={errors.weight}
              onBlur={handleChange}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="length"
              label="Chiều dài (cm)"
              type="number"
              fullWidth
              value={boxInfo.length}
              onChange={handleChange}
              error={!!errors.length}
              helperText={errors.length}
              onBlur={handleChange}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="width"
              label="Chiều rộng (cm)"
              type="number"
              fullWidth
              value={boxInfo.width}
              onChange={handleChange}
              error={!!errors.width}
              helperText={errors.width}
              onBlur={handleChange}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="height"
              label="Chiều cao (cm)"
              type="number"
              fullWidth
              value={boxInfo.height}
              onChange={handleChange}
              error={!!errors.height}
              helperText={errors.height}
              onBlur={handleChange}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Hủy</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!isFormValid()}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBoxDialog;
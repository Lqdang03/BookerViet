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

  // Update state when order changes or dialog opens
  useEffect(() => {
    if (order && open) {
      setBoxInfo({
        weight: order.boxInfo?.weight || "",
        length: order.boxInfo?.length || "",
        width: order.boxInfo?.width || "",
        height: order.boxInfo?.height || ""
      });
    }
  }, [order, open]);

  const handleChange = (e) => {
    setBoxInfo({
      ...boxInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    onSave(boxInfo);
    onClose();
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
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Hủy</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!boxInfo.weight || !boxInfo.length || !boxInfo.width || !boxInfo.height}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBoxDialog;
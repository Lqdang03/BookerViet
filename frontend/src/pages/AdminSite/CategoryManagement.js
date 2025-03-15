import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography
} from "@mui/material";
import axios from "axios";

const CategoryManagement = ({ open, onClose, categories, setCategories, mode }) => {
    const [categoryName, setCategoryName] = useState("");
    const [editedName, setEditedName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    useEffect(() => {
        if (mode === "edit" && selectedCategory) {
            const category = categories.find(cat => cat._id === selectedCategory);
            setEditedName(category?.name || "");
        }
    }, [selectedCategory, mode, categories]);

    const handleAddCategory = async () => {
        try {
            const response = await axios.post("http://localhost:9999/admin/categories", { name: categoryName });
            setCategories([...categories, response.data]);
            setCategoryName("");
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
        }
    };

    const handleEditCategory = async () => {
        try {
            await axios.put(`http://localhost:9999/admin/categories/${selectedCategory}`, { name: editedName });
            setCategories(categories.map(cat => cat._id === selectedCategory ? { ...cat, name: editedName } : cat));
        } catch (error) {
            console.error("Lỗi khi sửa danh mục:", error);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:9999/admin/categories/${selectedCategory}`);
            setCategories(categories.filter(cat => cat._id !== selectedCategory));
            setSelectedCategory("");
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {mode === "add" ? "Thêm danh mục" : mode === "edit" ? "Sửa danh mục" : "Xóa danh mục"}
            </DialogTitle>
            <DialogContent>
                {mode === "add" && (
                    <TextField fullWidth label="Tên danh mục" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} margin="dense" />
                )}

                {mode === "edit" && (
                    <>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Chọn danh mục</InputLabel>
                            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Tên mới" value={editedName} onChange={(e) => setEditedName(e.target.value)} margin="dense" />
                    </>
                )}

                {mode === "delete" && (
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Chọn danh mục cần xóa</InputLabel>
                        <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {categories.map((cat) => (
                                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                {mode === "add" && <Button variant="contained" color="primary" onClick={handleAddCategory}>Thêm</Button>}
                {mode === "edit" && <Button variant="contained" color="primary" onClick={handleEditCategory}>Cập nhật</Button>}
                {mode === "delete" && <Button variant="contained" color="error" onClick={handleDeleteCategory}>Xóa</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default CategoryManagement;

import React from "react";
import {
  Box,
  Typography,
  Rating,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Edit, Delete } from "@mui/icons-material";

const ReviewAndRating = ({
  tabValue,
  reviews,
  averageRating,
  userReview,
  showReviewForm,
  hasReviewed,
  rating,
  comment,
  editingReview,
  anchorEl,
  selectedReview,
  setEditingReview,
  setRating,
  setComment,
  setShowReviewForm,
  handleMenuOpen,
  handleMenuClose,
  handleEdit,
  handleDelete,
  handleSubmitEdit,
  handleSubmitReview,
}) => {
  return (
    <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ p: 3 }}>
      {tabValue === 1 && reviews.length === 0 ? (
        <Typography
          sx={{
            textAlign: "center",
            py: 4,
            fontSize: "1.2rem",
            color: "text.secondary",
          }}
        >
          Chưa có đánh giá nào cho sản phẩm này.
        </Typography>
      ) : (
        <>
          <Typography
            variant="h6"
            sx={{
              py: 2,
              fontWeight: "bold",
              color: "text.primary",
            }}
          >
            Đánh giá trung bình:
            <span style={{ display: "inline-flex" }}>
              <Rating
                value={averageRating}
                precision={0.1}
                readOnly
                sx={{ ml: 1 }}
              />
            </span>
            <span
              style={{
                marginLeft: "8px",
                fontSize: "1.1rem",
                color: "text.secondary",
              }}
            >
              {averageRating.toFixed(1)} / 5
            </span>
          </Typography>

          {/* Render danh sách review */}
          {reviews.map((review) => (
            <Card key={review._id} sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ position: "relative", p: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "text.primary",
                  }}
                >
                  {review.user.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                >
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ py: 1, fontSize: "1rem", color: "text.primary" }}
                >
                  {review.comment}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                >
                  <Rating value={review.rating} precision={0.1} readOnly />
                </Typography>

                {/* Hiển thị Edit và Delete nếu review thuộc về user */}
                {userReview && userReview._id === review._id && (
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <IconButton onClick={(e) => handleMenuOpen(e, review)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) &&
                        selectedReview &&
                        selectedReview._id === review._id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleEdit(review);
                          handleMenuClose();
                        }}
                      >
                        <Edit fontSize="small" sx={{ mr: 1 }} />
                        Chỉnh sửa
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(review._id);
                          handleMenuClose();
                        }}
                      >
                        <Delete fontSize="small" sx={{ mr: 1 }} />
                        Xóa
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Form chỉnh sửa review */}
          {editingReview && (
            <Box
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 2,
                boxShadow: 2,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
              >
                Chỉnh sửa đánh giá sản phẩm
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rating (1-5):
                </Typography>
                <Rating
                  value={editingReview.rating}
                  onChange={(e, newValue) =>
                    setEditingReview({ ...editingReview, rating: newValue })
                  }
                  precision={1}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Comment:
                </Typography>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      comment: e.target.value,
                    })
                  }
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitEdit}
                  sx={{ mr: 2 }}
                >
                  Lưu đánh giá
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => setEditingReview(null)}
                >
                  Hủy
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Nút mở form đánh giá nếu user chưa đánh giá */}
      {!showReviewForm && !hasReviewed && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowReviewForm(true)}
          sx={{ mt: 3, width: "100%", borderRadius: 2 }}
        >
          Đánh giá sản phẩm
        </Button>
      )}

      {/* Form gửi đánh giá */}
      {showReviewForm && (
        <Box
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
          >
            Đánh giá sản phẩm
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Rating (1-5):
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              precision={1}
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Comment:
            </Typography>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                fontFamily: "Arial, sans-serif",
              }}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitReview}
              sx={{ mr: 2 }}
            >
              Gửi đánh giá
            </Button>
            <Button
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={() => setShowReviewForm(false)}
            >
              Hủy
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ReviewAndRating;

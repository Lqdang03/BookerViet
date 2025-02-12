import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import ShopIcon from '@mui/icons-material/Shop';
import MusicVideoIcon from '@mui/icons-material/MusicVideo';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';


const Footer = () => {
    const companyInfo = {
        name: 'CÔNG TY CỔ PHẦN MĨ THUẬT & TRUYỀN THÔNG',
        address: 'Đại học FPT, Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội',
        phone: '0123123123',
        email: 'info@bookerviet.net.vn'
    };

    const sections = [
        {
            title: 'VỀ BookerViet',
            links: ['Giới thiệu', 'Điều khoản sử dụng', 'Tin tức', 'Tuyển dụng', 'Liên hệ với BookerViet']
        },
        {
            title: 'HỖ TRỢ KHÁCH HÀNG',
            links: [
                'Hướng dẫn mua hàng trực tuyến',
                'Quy định thẻ VIP',
                'Chính sách bảo mật',
                'Chính sách vận chuyển',
                'Chính sách đổi trả',
                'Hình thức thanh toán',
                'Chính sách bảo hành',
                'Câu hỏi thường gặp'
            ]
        }
    ];

    return (
        <Box component="footer" sx={{ 
            bgcolor: '#f5f5f5', 
            pt: 6, 
            pb: 0, 
            mt: 6, 
            position: 'relative', 
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px', 
                backgroundColor: 'primary.main'
            }
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={10}>
                    {/* Company Information */}
                    <Grid item xs={12} md={4}>
                        <Box>
                            <img src="/pictures/logo.png" alt="BookerViet" style={{ height: 150, width: 150, marginTop: -35, marginBottom: -20, marginLeft: 1}} />
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: "bold", fontSize: 20 }}>
                                {companyInfo.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <LocationOnIcon sx={{ mr: 1, mt: 0.5 }} color="primary" />
                                <Typography variant="body2">{companyInfo.address}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PhoneIcon sx={{ mr: 1 }} color="primary" />
                                <Typography variant="body2">{companyInfo.phone}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmailIcon sx={{ mr: 1 }} color="primary" />
                                <Typography variant="body2">{companyInfo.email}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* First Section */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight:"bold" }}>
                            {sections[0].title}
                        </Typography>
                        {sections[0].links.map((link, index) => (
                            <Link
                                key={index}
                                href="#"
                                sx={{
                                    display: 'block',
                                    mb: 2,
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {link}
                            </Link>

                        ))}

                        {/* Social Media Links */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight:'bold'}}>
                                THEO DÕI CHÚNG TÔI
                            </Typography>
                            <IconButton color="primary" aria-label="Facebook">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton color="primary" aria-label="Shopee">
                                <ShopIcon />
                            </IconButton>
                            <IconButton color="primary" aria-label="TikTok">
                                <MusicVideoIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Second Section */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                            {sections[1].title}
                        </Typography>
                        {sections[1].links.map((link, index) => (
                            <Link
                                key={index}
                                href="#"
                                sx={{
                                    display: 'block',
                                    mb: 2,
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {link}
                            </Link>
                        ))}
                    </Grid>
                </Grid>
                
                
                {/* Copyright */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 6, fontSize: '1rem', opacity : "0.5" }}
                >   
                    <hr style={{ 
                        marginBottom: '15px', 
                        borderColor: 'rgba(0,0,0,0.12)' 
                    }}/>
                    © Bản quyền thuộc về CTCP Mĩ thuật & Truyền thông
                    <br />
                    Giấy chứng nhận đăng ký doanh nghiệp số: 0123123123 - Ngày cấp giấy phép: 10/02/2025 Số KHDTHN
                </Typography>
            </Container>
        </Box>
    );

};

export default Footer;
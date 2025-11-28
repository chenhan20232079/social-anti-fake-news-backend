// backend/config/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * 初始化 Express 应用并配置中间件
 * @returns {express.Application}
 */
function createServer() {
    const app = express();

    // 解析 JSON 请求体
    app.use(express.json({ limit: '10mb' }));

    // 解析 URL 编码表单
    app.use(express.urlencoded({ extended: true }));

    // 启用 CORS（允许前端跨域请求）
    app.use(cors({
        origin: '*', // 生产环境应限制为具体域名
        credentials: true
    }));

    // 静态文件服务：提供上传的图片
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // 健康检查路由
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    return app;
}

module.exports = { createServer };
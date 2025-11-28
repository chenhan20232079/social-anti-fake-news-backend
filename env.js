// backend/config/env.js
const dotenv = require('dotenv');
const path = require('path');

// 加载 .env 文件
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// 验证必要环境变量
const requiredEnvVars = ['PORT', 'JWT_SECRET'];
for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        console.error(`❌ Missing environment variable: ${key}`);
        process.exit(1);
    }
}

// 导出配置对象
module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
};
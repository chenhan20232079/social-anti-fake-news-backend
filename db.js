// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to open database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database at', dbPath);
    }
});

// 初始化表结构（如果不存在）
db.serialize(() => {
    // users 表
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('reader', 'member', 'admin')) DEFAULT 'reader',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // news 表
    db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      reporter_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('fake', 'not-fake')) DEFAULT 'not-fake',
      image_url TEXT,
      is_deleted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // votes 表（每用户对每新闻只能投一票）
    db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      news_id INTEGER NOT NULL,
      is_fake BOOLEAN NOT NULL,
      comment_text TEXT,
      comment_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, news_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
    )
  `);

    // 插入默认管理员（仅当 users 表为空时）
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (!err && row.count === 0) {
            const adminPassword = require('bcrypt').hashSync('admin123', 10);
            db.run(
                `INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)`,
                ['Admin User', 'admin@example.com', adminPassword, 'admin', null],
                (err) => {
                    if (err) {
                        console.error('Failed to create default admin:', err.message);
                    } else {
                        console.log('✅ Default admin created: admin@example.com / admin123');
                    }
                }
            );
        }
    });
});

module.exports = db;
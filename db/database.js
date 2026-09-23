const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'alumni.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alumni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      reg_no TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      batch TEXT NOT NULL,
      dept TEXT NOT NULL,
      address TEXT,
      company TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_label TEXT,
      url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cms_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@alumni.org';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  db.get(`SELECT id FROM users WHERE email = ?`, [adminEmail], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash(adminPass, 10);
      db.run(`INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')`, [adminEmail, hash]);
      console.log(`[DB] Admin account initialized: ${adminEmail}`);
    }
  });

  const defaultCMS = [
    ['hero_title', 'Welcome to Our Alumni Community'],
    ['hero_desc', 'Reconnecting Friends | Building Networks | Shaping the Future'],
    ['hero_banner', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80'],
    ['notice_title', 'Annual Alumni Reunion 2026'],
    ['notice_date', '14 April 2026'],
    ['notice_desc', 'We are excited to announce the grand reunion celebration in the auditorium.'],
    ['contact_address', 'Administrative Building, Room 204\nUniversity Campus, Dhaka - 1216'],
    ['contact_emails', 'support@alumni-association.org\nreunion@alumni-association.org'],
    ['contact_phone', '+880 2 9876543 (Sun – Thu, 9:00 AM – 5:00 PM)']
  ];

  defaultCMS.forEach(([key, value]) => {
    db.run(`INSERT OR IGNORE INTO cms_settings (key, value) VALUES (?, ?)`, [key, value]);
  });
});

module.exports = db;

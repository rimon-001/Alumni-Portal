const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/auth');

router.get('/', (req, res) => {
  db.all(`SELECT * FROM cms_settings`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const cmsMap = {};
    rows.forEach(r => cmsMap[r.key] = r.value);
    res.json(cmsMap);
  });
});

router.post('/', verifyToken, (req, res) => {
  const settings = req.body;
  const stmt = db.prepare(`INSERT OR REPLACE INTO cms_settings (key, value) VALUES (?, ?)`);
  Object.entries(settings).forEach(([key, val]) => stmt.run(key, String(val)));
  stmt.finalize();
  res.json({ message: 'CMS updated' });
});

module.exports = router;

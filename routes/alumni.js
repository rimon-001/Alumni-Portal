const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all approved alumni (or all if ?status=all)
router.get('/', (req, res) => {
  const status = req.query.status;
  const sql = status === 'all'
    ? 'SELECT * FROM alumni ORDER BY id DESC'
    : 'SELECT * FROM alumni WHERE status = "Approved" ORDER BY id DESC';

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single alumnus by id or reg_no
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM alumni WHERE id = ? OR reg_no = ?', [req.params.id, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Alumnus record not found.' });
    res.json(row);
  });
});

// POST register new alumnus from public portal
router.post('/register', (req, res) => {
  const { name, reg_no, email, phone, batch, dept, address, avatar } = req.body;
  if (!name || !reg_no || !email || !batch || !dept) {
    return res.status(400).json({ error: 'Required fields missing: name, reg_no, email, batch, dept.' });
  }

  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const stmt = 'INSERT INTO alumni (name, reg_no, email, phone, batch, dept, address, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.run(stmt, [name, reg_no, email, phone || '', batch, dept, address || '', defaultAvatar, 'Pending'], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'This registration number or email is already registered.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Registration submitted! Waiting for admin approval.' });
  });
});

module.exports = router;
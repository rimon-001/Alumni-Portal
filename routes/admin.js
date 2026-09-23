const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/auth');

// Protect all admin endpoints with JWT token verification
router.use(verifyToken);

// 1. Get statistics overview
router.get('/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending
    FROM alumni
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// 2. Get all members (supports filter ?status=Pending or ?status=Approved or ?status=all)
router.get('/members', (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM alumni WHERE 1=1';
  let params = [];

  if (status && status !== 'all') {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR reg_no LIKE ? OR dept LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. Add member directly from admin panel
router.post('/members', (req, res) => {
  const { name, reg_no, email, phone, batch, dept, address, avatar, status } = req.body;
  if (!name || !reg_no || !email) {
    return res.status(400).json({ error: 'Name, registration number, and email are required.' });
  }

  const memberStatus = status || 'Approved';
  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const sql = 'INSERT INTO alumni (name, reg_no, email, phone, batch, dept, address, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.run(sql, [name, reg_no, email, phone || '', batch || '', dept || '', address || '', defaultAvatar, memberStatus], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Registration number or email already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Member created successfully.' });
  });
});

// 4. Approve member
router.put('/members/:id/approve', (req, res) => {
  db.run('UPDATE alumni SET status = "Approved" WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Member not found.' });
    res.json({ message: 'Member approved successfully.' });
  });
});

// 5. Edit member details
router.put('/members/:id', (req, res) => {
  const { name, reg_no, email, phone, batch, dept, address, status } = req.body;
  const sql = `
    UPDATE alumni 
    SET name = ?, reg_no = ?, email = ?, phone = ?, batch = ?, dept = ?, address = ?, status = ?
    WHERE id = ?
  `;
  db.run(sql, [name, reg_no, email, phone, batch, dept, address, status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Member not found.' });
    res.json({ message: 'Member updated successfully.' });
  });
});

// 6. Delete member
router.delete('/members/:id', (req, res) => {
  db.run('DELETE FROM alumni WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Member not found.' });
    res.json({ message: 'Member removed successfully.' });
  });
});

module.exports = router;
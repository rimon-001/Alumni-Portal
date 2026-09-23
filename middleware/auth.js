const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Access denied. Please login.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

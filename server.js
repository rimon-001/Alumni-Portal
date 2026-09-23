require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const alumniRoutes = require('./routes/alumni');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const cmsRoutes = require('./routes/cms');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' and 'uploads'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/cms', cmsRoutes);

// Explicit route for the Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all route for Single Page Application navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alumni Portal server running at: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
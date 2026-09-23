require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const alumniRoutes = require('./routes/alumni');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const cmsRoutes = require('./routes/cms');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/cms', cmsRoutes);

// Catch-all route for Single Page Application
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening and keep event loop alive
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alumni Portal server running at: http://localhost:${PORT}`);
});

// Keep process active in Node
setInterval(() => {}, 1000 << 16);

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

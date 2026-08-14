'use strict';

const path = require('path');
const express = require('express');
const adminApi = require('./routes/adminApi');
const publicApi = require('./routes/publicApi');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use('/api/admin', adminApi);
app.use('/api/public', publicApi);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`review-admin listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

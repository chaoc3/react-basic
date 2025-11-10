// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This means any request that starts with /api will be proxied
    createProxyMiddleware({
      target: 'http://localhost:3001', // The address of your backend server
      changeOrigin: true,
    })
  );
};
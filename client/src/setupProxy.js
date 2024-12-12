const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/seats",
    createProxyMiddleware({
      target: "https://train-reservation-system.onrender.com",
      changeOrigin: true,
    })
  );
};

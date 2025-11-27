const { rateLimit } = require("express-rate-limit");

// Limiteur global pour toute l'application
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes par IP dans la fenêtre de temps
  message: "Trop de requêtes provenant de cette IP, veuillez réessayer plus tard.",
});

// Limiteur spécifique pour les tentatives de connexion
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Maximum 3 tentatives de connexion par IP dans la fenêtre de temps
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
});

module.exports = { globalLimiter, authLimiter };

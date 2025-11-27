const express = require("express");
const router = express.Router();
const validator = require("../middleware/validator");
const limiter = require("../middleware/limiter");
const userCtrl = require("../controllers/user");

// Routes pour l'authentification des utilisateurs
router.post("/signup", validator, userCtrl.signup);
router.post("/login", limiter.authLimiter, userCtrl.login);

module.exports = router;

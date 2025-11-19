const validator = require("express-validator");

module.exports = (req, res, next) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide." });
  }
  if (!password || !passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 8 caractères, dont au moins une lettre et un chiffre." });
  }
  next();
};

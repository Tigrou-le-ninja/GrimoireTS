const { checkSchema, validationResult } = require("express-validator");

// Schéma de validation pour les données utilisateur
const userSchema = {
  email: {
    in: ["body"],
    exists: {
      errorMessage: "L'adresse e-mail est requise.",
      options: { checkFalsy: true },
    },
    isEmail: {
      errorMessage: "Adresse e-mail invalide.",
    },
    trim: true,
    normalizeEmail: true,
  },
  password: {
    in: ["body"],
    exists: {
      errorMessage: "Le mot de passe est requis.",
      options: { checkFalsy: true },
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Le mot de passe doit contenir au moins 8 caractères.",
    },
    matches: {
      options: [/(?=.*[A-Za-z])(?=.*\d)/],
      errorMessage: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
    },
  },
};

module.exports = [
  checkSchema(userSchema),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Contrôleurs pour l'authentification des utilisateurs

// Inscription d'un nouvel utilisateur
exports.signup = async (req, res, next) => {
  try {
    // Le mot de passe est haché 10 fois avant d'être stocké
    const hash = await bcrypt.hash(req.body.password, 10);
    // Nouvelle instance de User avec l'e-mail et le mot de passe haché
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    // Sauvegarde de l'utilisateur dans la base de données
    await user.save();
    return res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    // Vérification de l'unicité de l'adresse e-mail
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Adresse e-mail déjà utilisée ! " + (error.errmsg || "") });
    }
    // Gestion des erreurs de validation
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ error });
    }
    return res.status(500).json({ error });
  }
};

// Connexion d'un utilisateur existant
exports.login = async (req, res, next) => {
  try {
    // Recherche de l'utilisateur dans la base de données par e-mail
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé !" });
    }

    // Comparaison du mot de passe fourni avec le mot de passe haché stocké
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Couple identifiant / mot de passe incorrect !" });
    }

    // Génération d'un token JWT valide 24h
    const token = jwt.sign({ userId: user._id }, `${encodeURIComponent(process.env.SALT_KEY)}`, { expiresIn: "24h" });

    return res.status(200).json({ userId: user._id, token });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

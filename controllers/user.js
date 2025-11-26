const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signup = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    await user.save();
    return res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Adresse e-mail déjà utilisée ! " + (error.errmsg || "") });
    }
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ error });
    }
    return res.status(500).json({ error });
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé !" });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Couple identifiant / mot de passe incorrect !" });
    }

    const token = jwt.sign({ userId: user._id }, `${encodeURIComponent(process.env.SALT_KEY)}`, { expiresIn: "24h" });

    return res.status(200).json({ userId: user._id, token });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

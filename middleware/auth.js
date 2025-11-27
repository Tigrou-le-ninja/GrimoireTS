const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware d'authentification pour protéger les routes
module.exports = (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const token = req.headers.authorization.split(" ")[1];
    // Vérification et décodage du token
    const decodedToken = jwt.verify(token, `${encodeURIComponent(process.env.SALT_KEY)}`);
    // Extraction de l'userId du token décodé
    const userId = decodedToken.userId;
    // Ajout de l'userId à l'objet req pour une utilisation ultérieure
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};

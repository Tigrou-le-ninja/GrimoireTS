const express = require("express");
const mongoose = require("mongoose");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");
const path = require("path");
const limiter = require("./middleware/limiter");
require("dotenv").config();

// Création de l'application Express
const app = express();

// Connexion à la base de données MongoDB
mongoose
  .connect(
    `mongodb+srv://TheoS:${encodeURIComponent(
      process.env.DB_PASSWORD
    )}@grimoirets.cvrmgy6.mongodb.net/?appName=GrimoireTS`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Gestion CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

// Gérer les images de manière statique
app.use("/images", express.static(path.join(__dirname, "images")));

// Limiteur global des requêtes pour éviter les attaques DDOS
app.use(limiter.globalLimiter);

// Routes de l'application
app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;

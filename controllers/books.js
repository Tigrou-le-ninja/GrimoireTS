const Book = require("../models/Book");
const fs = require("fs");

// Création d'un nouveau livre
exports.createBook = async (req, res, next) => {
  try {
    // Récupération et traitement des données du livre
    const bookObject = JSON.parse(req.body.book);
    // Suppression des champs non nécessaires et/ou pouvant poser problème
    delete bookObject._id;
    delete bookObject._userId;
    // Création d'une nouvelle instance de Book avec les données reçues
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    // Sauvegarde du livre dans la base de données
    await book.save();
    res.status(201).json({ message: "Objet enregistré !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Récupération d'un livre par son identifiant
exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Modification d'un livre existant
exports.modifyBook = async (req, res, next) => {
  try {
    // Vérification de la présence d'un fichier image dans la requête
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });

    // Vérification que l'utilisateur modifiant le livre est bien celui qui l'a créé
    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "403: Not authorized" });
    }

    // Si une nouvelle image est fournie, supprimer l'ancienne image du serveur
    if (req.file) {
      const filename = book.imageUrl.split("/images/")[1];
      try {
        await fs.promises.unlink(`images/${filename}`);
      } catch (err) {
        console.log("Erreur suppression image précédente :", err);
        // Ne pas bloquer la modification du livre si la suppression de l'image échoue
      }
    }

    // Mise à jour du livre dans la base de données
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Suppression d'un livre existant
exports.deleteBook = async (req, res) => {
  try {
    // Récupérer le livre existant avec son identifiant
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }
    // Vérifier si l'utilisateur qui essaie de supprimer le livre est bien celui qui l'a créé
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé !" });
    }
    // Récupérer l'URL de l'image du livre
    const filename = book.imageUrl.split("/images/")[1];
    // Supprimer le fichier image du serveur
    fs.unlink(`images/${filename}`, async () => {
      try {
        // Supprimer le livre de la base de données
        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Livre supprimé !" });
      } catch (error) {
        res.status(401).json({ error });
      }
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Récupération de tous les livres
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Noter un livre
exports.rateBook = async (req, res, next) => {
  try {
    // Vérifier que la note est comprise entre 1 et 5
    const rating = req.body.rating;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être comprise entre 1 et 5" });
    }

    // Stocker la note
    const ratingObject = { ...req.body, grade: rating };
    delete ratingObject._id;

    const book = await Book.findOne({ _id: req.params.id });

    // Vérifier si l'utilisateur a déjà noté ce livre
    const userIdArray = book.ratings.map((r) => r.userId);
    if (userIdArray.includes(req.auth.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Ajouter la nouvelle note
    const newRatings = [...book.ratings, ratingObject];

    // Calculer la note moyenne
    const average = (array) => {
      let sum = 0;
      for (let nb of array) {
        sum += nb;
      }
      return (sum / array.length).toFixed(1);
    };
    const grades = newRatings.map((r) => r.grade);
    const averageGrade = average(grades);
    // Mettre à jour la note moyenne du livre
    book.averageRating = averageGrade;

    // Mettre à jour le livre avec la nouvelle note et la note moyenne
    await Book.updateOne(
      { _id: req.params.id },
      { ratings: newRatings, averageRating: averageGrade, _id: req.params.id }
    );

    return res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

// Récupérer les 3 livres les mieux notés
exports.getBestRating = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

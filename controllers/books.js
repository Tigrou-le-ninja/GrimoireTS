const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    await book.save();
    res.status(201).json({ message: "Objet enregistré !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "403: Not authorized" });
    }

    if (req.file) {
      const filename = book.imageUrl.split("/images/")[1];
      try {
        await fs.promises.unlink(`images/${filename}`);
      } catch (err) {
        console.log("Erreur suppression image précédente :", err);
        // continuer malgré l'erreur de suppression de fichier
      }
    }

    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    // Récupérer le book existant avec son identifiant
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }
    // Vérifier si l'utilisateur qui essaie de supprimer le book est bien celui qui l'a créé
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé !" });
    }
    // Récupérer l'URL de l'image du book
    const filename = book.imageUrl.split("/images/")[1];
    // Supprimer le fichier image du serveur
    fs.unlink(`images/${filename}`, async () => {
      // Supprimer le book de la base de données
      try {
        await Book.deleteOne({ _id: req.params.id });
        // Envoyer une réponse de succès ou d'erreur
        res.status(200).json({ message: "Livre supprimé !" });
      } catch (error) {
        res.status(401).json({ error });
      }
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.rateBook = async (req, res, next) => {
  try {
    const rating = req.body.rating;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être comprise entre 1 et 5" });
    }

    const ratingObject = { ...req.body, grade: rating };
    delete ratingObject._id;

    const book = await Book.findOne({ _id: req.params.id });

    const userIdArray = book.ratings.map((r) => r.userId);
    if (userIdArray.includes(req.auth.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Ajouter la nouvelle note
    const newRatings = [...book.ratings, ratingObject];

    // Calculer la moyenne
    const average = (array) => {
      let sum = 0;
      for (let nb of array) {
        sum += nb;
      }
      return (sum / array.length).toFixed(1);
    };
    const grades = newRatings.map((r) => r.grade);
    const averageGrade = average(grades);
    book.averageRating = averageGrade;

    // Mettre à jour en base
    await Book.updateOne(
      { _id: req.params.id },
      { ratings: newRatings, averageRating: averageGrade, _id: req.params.id }
    );

    return res.status(201).json({ message: "Note ajoutée", averageRating: averageGrade });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.getBestRating = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    return res.status(200).json(books);
  } catch (error) {
    return res.status(404).json({ error });
  }
};

const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
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

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

const multer = require("multer");

const maxSize = 1 * 1024 * 1024;

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Le fichier selectionné n'est pas une image" }, false);
  }
};

/**
 * Configuration de stockage mémoire Multer pour les téléchargements de fichiers.
 * Stocke les fichiers téléchargés en mémoire sous forme de Buffer.
 * Les fichiers sont accessibles via req.file.buffer après le traitement.
 *
 * @type {multer.StorageEngine}
 */

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { file: 1, fileSize: maxSize },
  fileFilter: multerFilter,
});

module.exports = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) return res.status(400).send({ error });
    next();
  });
};

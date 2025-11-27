const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

/**
 * Middleware pour la conversion d'images en format WebP avec redimensionnement
 *
 * Ce middleware traite les fichiers uploadés en les convertissant au format WebP
 * et en les redimensionnant aux valeurs attendues par le front. Utilise le buffer
 * au lieu de sauvegarder le fichier sur disque.
 *
 * @async
 * @function
 * @param {Object} req - L'objet de requête Express
 * @param {Object} req.file - Le fichier uploadé via multer
 * @param {string} req.file.originalname - Le nom original du fichier uploadé
 * @param {Buffer} req.file.buffer - Le buffer contenant les données du fichier
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction de callback pour passer au middleware suivant
 *
 * @description
 * - Vérifie la présence d'un fichier dans la requête
 * - Extrait le nom du fichier sans son extension
 * - Traite le buffer de l'image avec Sharp
 * - Redimensionne l'image à la largeur et la hauteur attendues par ke front
 * - Convertit l'image au format WebP
 * - Stocke le buffer résultant dans req.file.buffer
 * - Passe au middleware suivant
 *
 * @requires sharp - Bibliothèque de traitement d'images
 * @module middleware/sharp
 */

module.exports = async (req, res, next) => {
  console.log(req.file);
  if (req.file && req.file.buffer) {
    // Vérifie si le fichier a été modifié
    console.log(req.file);
    const newName = req.file.originalname.split(".")[0];
    req.file.filename = newName + ".webp";
    req.file.mimetype = "image/webp";

    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 206, height: 260 })
      .webp({ quality: 80 })
      .toBuffer();

    // url dossier images
    const imagesDir = path.join(__dirname, "..", "images");

    // Sauvegarder l'image sur le disque
    const filePath = path.join(imagesDir, req.file.filename);
    await fs.writeFile(filePath, processedBuffer);

    console.log(`Image sauvegardée: ${filePath}`);
    req.file.buffer = processedBuffer;
    req.file.path = filePath;
  }

  next();
};

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  try {
    const newName = "resized-" + req.file.filename;
    const newFilePath = path.join("images", newName);
    const filePath = req.file.path;
    await sharp(filePath).resize(250).webp({ quality: 80 }).toFile(newFilePath);

    req.file.filename = newName;
    await fs.promises.unlink(filePath);
    req.file.path = newFilePath;
    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du traitement de l'image" });
  }
};

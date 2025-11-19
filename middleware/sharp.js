const sharp = require("sharp");

module.exports = async (req, res, next) => {
  try {
    const buffer = req.file;
    const data = await sharp(buffer).resize(250).toBuffer();
    req.file.buffer = data;
    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du traitement de l'image" });
  }
};

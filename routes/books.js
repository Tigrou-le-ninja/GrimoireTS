const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp");

const booksCtrl = require("../controllers/books");

router.get("/", auth, booksCtrl.getAllBooks);
router.post("/", auth, multer, sharp, booksCtrl.createBook);
router.get("/:id", auth, booksCtrl.getOneBook);
router.put("/:id", auth, multer, sharp, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.get("/bestrating", booksCtrl.getBestRating);
router.post("/:id/rating", auth, booksCtrl.rateBook);

module.exports = router;

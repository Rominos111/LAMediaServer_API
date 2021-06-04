import express from "express";

let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.status(200).json({ title: 'Express' });
});

module.exports = router;

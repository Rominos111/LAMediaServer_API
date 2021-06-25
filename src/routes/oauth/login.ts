import express from "express";
import {OAuth} from "helper/OAuth";

const router = express.Router();

router.get("/", (req, res) => {
    res.redirect(OAuth.getUri() + "&service=" + encodeURIComponent(req.query.service as string));
});

module.exports = router;

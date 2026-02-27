const express = require("express");
const router = express.Router();

// User routes handled by Firebase Auth (frontend)

router.get("/", (req, res) => {
  res.send("User route active");
});

module.exports = router;

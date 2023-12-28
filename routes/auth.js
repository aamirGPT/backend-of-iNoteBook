const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Create a user using: POST "/api/auth". Doesn't require authentication.
router.post("/", (req, res) => {
    console.log(req.body);
    const user = new User(req.body);
    user.save();
    res.send("hello");
});

module.exports = router;

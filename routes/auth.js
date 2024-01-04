const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Create a user using: POST "/api/auth/createuser". Mo login required.
router.post(
  "/createuser",
  body("name", "Enter a Valid Name").isLength({ min: 3 }).notEmpty(),
  body("password", "Enter a Valid Password").isLength({ min: 5 }).notEmpty(),
  body("email", "Enter a Valid Email").isEmail().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    try {
      //Check whether the user with same email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return (res.status(400).json({error: "A user with this email already exists"}))
      }
      //Creating a new user
      if (result.isEmpty()) {
        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        return res.json(user);
      }
    } catch (error) {
      return res.status(500).json({
        error: "An error occurred while saving the user",
        message: error.message,
      });
    }
    res.send({ errors: result.array() });
  }
);

module.exports = router;

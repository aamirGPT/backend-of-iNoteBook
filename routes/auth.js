const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Create a user using: POST "/api/auth". Doesn't require authentication.
router.post(
    "/",
    body("name", "Enter a Valid Name").isLength({ min: 3 }).notEmpty(),
    body("password", "Enter a Valid Password").isLength({ min: 5 }).notEmpty(),
    body("email", "Enter a Valid Email").isEmail().notEmpty(),
    (req, res) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            return User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            })
                .then((user) => res.json(user))
                .catch((error) => {
                    res.status(500).json({
                        error: "An error occurred while saving the user",
                        message: error
                    });
                });
        }

        res.send({ errors: result.array() });
    }
);

module.exports = router;

const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const router = express.Router();
const JWT_SECRET = "A$MERN$PROJECT";

//* ROUTE 1: Create a user using: POST "/api/auth/createuser". No login required.

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
                return res
                    .status(400)
                    .json({ error: "A user with this email already exists" });
            }
            //Creating a SALT
            const salt = await bcrypt.genSalt(10); // SALT is used to add a random string to the password before encryption.
            let securePassword = await bcrypt.hash(req.body.password, salt);
            //Creating a new user
            if (result.isEmpty()) {
                user = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: securePassword,
                });
                const data = {
                    user: {
                        id: user.id,
                    },
                };
                const authToken = jwt.sign(data, JWT_SECRET);

                return res.json({ authToken });
                // return res.json(user);
            }
        } catch (error) {
            return res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
            });
        }
        res.send({ errors: result.array() });
    }
);

//* ROUTE 2: Authenticate a user using: POST "/api/auth/loginuser". No login required.

router.post(
    "/loginuser",
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Please enter a password").exists(),
    async (req, res) => {
        // Validating the inputs if it is email and the password exists
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Check whether the user with same email exists already
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ error: "Please enter correct credentials" });
            }
            const passwordCompare = await bcrypt.compare(
                password,
                user.password
            );
            if (!passwordCompare) {
                return res
                    .status(400)
                    .json({ error: "Please enter correct credentials" });
            }
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            return res.json({ authToken });
        } catch (error) {
            return res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
            });
        }
    }
);

//* ROUTE 3: Get user details using POST "/api/auth/getuser". Login Required

router.post("/getuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
        });
    }
});

module.exports = router;

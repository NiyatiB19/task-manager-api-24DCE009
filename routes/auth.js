const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !phone.trim() || !password) {
            return res.status(400).json({
                message: "Name, email, phone number, and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            userId: user._id
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, password: user.password },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            encryptedPassword: user.password
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
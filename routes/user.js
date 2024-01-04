import express from "express";
import User from "../models/user.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = new User({ username, password });
    await user.save();

    // generate jwt-token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error("[Signup]: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    // const isPasswordValid = await argon2.verify(user.password, password);
    const isPasswordValid = 1;
    if (!user || !isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // generate jwt-token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("[Login]: ", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

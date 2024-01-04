import express from "express";
import jwt from "jsonwebtoken";
import Note from "../models/note.js";

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  // Check if the header is present
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const [bearer, token] = authHeader.split(" ");

  // Check if the header has the expected format
  if (bearer !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Invalid Authorization header format" });
  }
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, "your-secret-key", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// create a note
router.post("/", authenticateToken, async (req, res) => {
  try {
    const note = new Note({ ...req.body, owner: req.user.userId });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// get all notes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("[userId]: ", userId);

    const notes = await Note.find({
      $or: [{ owner: userId }, { sharedWith: { $in: [userId] } }],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      {
        new: true,
      }
    );
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a note
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Note.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for notes based on keywords for the authenticated user
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res
        .status(400)
        .json({ error: 'Query parameter "q" is required for search' });
    }
    const regex = new RegExp(query, "i");

    const notes = await Note.find({
      // $and: [{ $text: { $search: query } }],
      $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a note by ID for the authenticated user
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/share", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Username is required for sharing" });
    }

    // Add the username to the sharedWith array
    note.sharedWith.push(userId);
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

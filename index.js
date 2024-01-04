import express from "express";
import connectToDb from "./utils/connectToDb.js";
import noteRoutes from "./routes/note.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/notes", noteRoutes);

app.listen(PORT, () => {
  console.log(`[Server]: Server is running on port ${PORT}`);
  connectToDb();
});

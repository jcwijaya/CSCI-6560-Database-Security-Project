import express from "express";
const app = express();

import authRouter from "./src/routes/api/auth.js";
import usersRouter from "./src/routes/api/users.js";
import uploadsRouter from "./src/routes/api/uploads.js";
import bucketsRouter from "./src/routes/api/buckets.js";
import downloadsRouter from "./src/routes/api/downloads.js";

app.use(express.json());

// ROUTES
app.use("/api/users", usersRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/buckets", bucketsRouter);
app.use("/api/auth", authRouter);
app.use("/api/downloads", downloadsRouter);

const expressServer = app.listen(5000, () => {
  console.log("listening on port 5000");
});

import express from "express";
const app = express();

import usersRouter from "./src/routes/api/users.js";
import uploadsRouter from "./src/routes/api/uploads.js";
import bucketsRouter from "./src/routes/api/buckets.js";

app.use(express.json());

// ROUTES
app.use("/api/users", usersRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/buckets", bucketsRouter);

const expressServer = app.listen(5000, () => {
  console.log("listening on port 5000");
});

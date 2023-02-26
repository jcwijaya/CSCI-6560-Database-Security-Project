import express from "express";
const app = express();

import usersRouter from "./src/routes/api/users.js";
import uploadsRouter from "./src/routes/api/uploads.js";
import bucketsRouter from "./src/routes/api/buckets.js";

app.use(express.json());

/* FOR LOCAL FILE UPLOAD 
// Also as second argument to app.post():
// upload.single("uploaded_file"),
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //Appending extension
  },
});

const upload = multer({ storage });
*/

// ROUTES
app.use("/api/users", usersRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/buckets", bucketsRouter);

const expressServer = app.listen(5000, () => {
  console.log("listening on port 5000");
});

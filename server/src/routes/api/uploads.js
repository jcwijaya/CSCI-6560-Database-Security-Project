import express from "express";
import uploader from "../../services/uploader.js";
import multer from "multer";

const uploadsRouter = express.Router();

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

uploadsRouter.use(multerMid.single("uploaded_file"));

// Upload a new file to a bucket specified by "BUCKET_ID" in .env file.
// This is to simply add a file to a bucket through http for testing purposes.
uploadsRouter.post("/", async (req, res) => {
  console.log("File upload attempted:");
  console.log(req.file);
  try {
    const fileUrl = await uploader(req.file);
    res.status(200).json({ message: "File upload successful", data: fileUrl });
  } catch (err) {
    console.log(err);
    return res.status(500).send("There was an error uploading the file");
  }
});

export default uploadsRouter;

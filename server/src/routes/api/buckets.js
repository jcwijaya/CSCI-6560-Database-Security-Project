import express from "express";
import createBucket from "../../services/bucketCreator.js";

const bucketsRouter = express.Router();

// Use service "bucketCreator" to create a new bucket with identifier specified
// by req.body.bucket_name
bucketsRouter.post("/", async (req, res) => {
  try {
    const bucket_name = req.body.bucket_name;
    console.log(`User attempted to create bucket ${bucket_name}`);
    await createBucket(bucket_name);
    return res.status(201).json({
      bucket_name,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 409) {
      return res.status(400).json({
        message: "Bucket name unavailable- please choose a different name.",
      });
    } else
      return res.status(500).json({
        errors: err.errors,
      });
  }
});

export default bucketsRouter;

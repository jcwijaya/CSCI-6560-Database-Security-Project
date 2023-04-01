import express from "express";
import uploader from "../../services/uploader.js";
import multer from "multer";
import { v1 as uuidv1 } from "uuid";
import { FileRole } from "../../models/enums/Roles.js";

const uploadsRouter = express.Router();

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
// @route    POST /api/uploads
// @desc     upload file into specified bucket (Action create file and update file)
// @access   PRIVATE
/* body parameters: 
{
  bucket_id: unique identifying name of bucket,
  targetUserId: user_id in db that uniquely identifies user,
  targetRole: string identifying new role for specified user (see models/enums/roles)
}
*/
//TODO: use roleAuth to check that user has permission to create file in this bucket
//TODO: how to tell apart file creation vs file edit/overwrite???, just do query to check if file already exists???
uploadsRouter.post("/", async (req, res) => {
  console.log("File upload attempted:");
  console.log(req.file);
  try {

    //TODO: need to pass in the bucket_id to uploader too.
    //Need to insert row into file table, generate an id for file_id, how to get file version?
    //Need to insert user as the FILE_OWNER in the file_user table
    const fileUrl = await uploader(req.file);
    res.status(200).json({ message: "File upload successful", data: fileUrl });
  } catch (err) {
    console.log(err);
    return res.status(500).send("There was an error uploading the file");
  }
//----------------------------------------------------------------------------

  console.log("File upload attempted:");
  const bucket_name = req.body.bucket_name;
  const user_id = req.user.user_id;
  const file = req.file;
  if (user_id == null || bucket_name == null || file == null) {
    console.log("missing header, bucket_name, or file");
    return res.status(500).json({ error: "missing user_id, bucket_name, or file" });
  }
  //TODO: may need to query DB to check if file exists already

  try {
  //upload file here
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "There was an error uploading the file",
      errors: err.errors,
    });
  }

  //TODO: Databse inserts
  try {
    let file_id = uuidv1();
    //TODO: insert into file table with generate file id and version(generation number in metadata)
    connection.query(
      "INSERT INTO file VALUES (?, ?, ?, ?, ?)",
      [file_id, bucket_name, file_name, version, true],
      function (error, results) {
        if (error) {
          console.log("Database error: ", error);
          //TODO: when trying to create bucket with nonexistent user_id it says successful when it is not
          return res.status(500).send({
            message: "There was an error connecting to the database: ",
            error,
          });
        }
        console.log("Database insert successful: ", user_id);
      }
    );

    //TODO: insert user has owner of file into file_user
    connection.query(
      "INSERT INTO file_user VALUES (?, ?, ?)",
      [file_id, user_id, FileRole.FILE_OWNER.string],
      function (error, results) {
        if (error) {
          console.log("Database error: ", error);
          return res.status(500).send({
            message: "There was an error connecting to the database: ",
            error,
          });
        }
        console.log("Database insert successful: ", user_id);
      }
    );

    return res.status(201).json({
      bucket_name,
      message: "File uploaded and database insert successful.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

export default uploadsRouter;

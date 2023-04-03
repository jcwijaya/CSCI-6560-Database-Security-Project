import express from "express";
import uploader from "../../services/uploader.js";
import getMetadata from "../../services/fileMetadata.js";
import connection from "../../services/database.js";
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
// @route    POST /api/uploads/create-file
// @desc     upload file into specified bucket 
// @access   PRIVATE
/* body parameters: 
{
  bucket_name: unique identifying name of bucket,
  user_id: 
}
*/
//TODO: use roleAuth to check that user has permission to create file in this bucket
//TODO: need to tell apart file creation vs file edit/overwrite, do query to check if file already exists
uploadsRouter.post("/create-file", async (req, res) => {

  console.log("File upload attempted:");
  let bucket_name = req.body.bucket_name;
  let user_id = req.body.user_id;
  let file = req.file;
  console.log("request: ", req.body);
  console.log("bucket: ", bucket_name);
  console.log("user: ", user_id);
  console.log("file: ", file)
  if (user_id == null || bucket_name == null || file == null) {
    console.log("missing header, bucket_name, or file");
    return res.status(500).json({ error: "missing user_id, bucket_name, or file" });
  }

  try {
  //TODO: From fileUrl need to get file's name***
  const fileUrl = await uploader(bucket_name, req.file);

  console.log("File upload successful: ", fileUrl)
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "There was an error uploading the file",
      errors: err.errors,
    });
  }

  try {
    let file_id = uuidv1();
    //TODO: add error handling for this part
    let metadata = await getMetadata(bucket_name, file.originalname.replace(/ /g, "_"));
    console.log("metadata: ", metadata);
   //NOTE: this generated id for version is just a placeholder. I will update it to get the actual generation number from gcp
   let version = metadata.generation; 
    //TODO: insert into file table with generate file id and version(generation number in metadata)
    //If we are doing an edit instead of create, must uncheck the isActive flag in the DB.
    //Also should add a date column to file table
    connection.query(
      "INSERT INTO file VALUES (?, ?, ?, ?, ?, ?)",
      [file_id, bucket_name, file.originalname, version, true, new Date(metadata.timeCreated)],
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

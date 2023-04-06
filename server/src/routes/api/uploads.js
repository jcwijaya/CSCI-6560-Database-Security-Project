import express from "express";
import uploader from "../../services/uploader.js";
import getMetadata from "../../services/fileMetadata.js";
import connection from "../../services/database.js";
import multer from "multer";
import { v1 as uuidv1 } from "uuid";
import { FileRole } from "../../models/enums/Roles.js";
import { Action } from "../../models/enums/Actions.js";
import auth from "../../middlewares/auth.js";
import fileRoleAuth from "../../middlewares/fileRoleAuth.js";

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

// This is to add a file to a bucket
// @route    POST /api/uploads/upload-file
// @desc     upload file into specified bucket
// @access   PRIVATE
/* body parameters: 
{
  bucket_name: string,  unique identifying name of bucket,
  uploaded_file: file to be uploaded in reqeust as multi part form data
}
*/
//TODO: this is still a work in progress
uploadsRouter.post("/upload-file", auth, fileRoleAuth, async (req, res) => {
  // extract vars and log them
  console.log("File upload attempted:");
  let bucket_name = req.body.bucket_id;
  let user_id = req.user.user_id;
  let file = req.file;
  let uploadedFileName = null;
  let metadata = null;
  let fileData = [];
  console.log("request: ", req.body);
  console.log("bucket: ", bucket_name);
  console.log("user: ", user_id);
  console.log("file: ", file);

  // check for necessary parameters
  if (user_id == null || bucket_name == null || file == null) {
    console.log("missing header, bucket_name, or file");
    return res
      .status(500)
      .json({ error: "missing user_id, bucket_name, or file" });
  }

  // query database to check if file exists (it shouldn't)
  fileData = await databaseQuery(
    "SELECT * FROM `file` WHERE bucket_id = ? AND file_name = ?",
    [bucket_name, uploadedFileName]
  );

  // If file does not already exist, attempt upload
  if (fileData.length === 0) {
    console.log("file does not exist- can be uploaded as new file");

    try {
      // upload file to bucket
      const fileUrl = await uploader(bucket_name, req.file);
      let urlArray = fileUrl.split("/");
      uploadedFileName = urlArray[urlArray.length - 1];

      console.log("File upload successful: ", fileUrl, uploadedFileName);

      // get metadata for file (to have upload timestamp extracted)
      metadata = await getMetadata(bucket_name, uploadedFileName);
      console.log("Metadata was fetched successfully: ", metadata);

      // file upload successful, so need to insert in database
      try {
        const insertResults = await createFile(
          uploadedFileName,
          metadata,
          bucket_name,
          user_id
        );
        return res.status(201).json(insertResults);
      } catch (err) {
        return res.status(500).json({
          errors: err.errors,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        errors: err.errors,
      });
    }
  }

  return res.status(400).json({
    msg: "Bad request- unable to upload file. The file might already be present in the bucket, in which case a file update is needed.",
  });

  /*
  try {

  const fileUrl = await uploader(bucket_name, req.file);
  let urlArray = fileUrl.split("/");
  uploadedFileName = urlArray[urlArray.length-1]


  console.log("File upload successful: ", fileUrl, uploadedFileName)

  metadata = await getMetadata(bucket_name, uploadedFileName);
  console.log("Metadata was fetched successfully: ", metadata);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: err.errors,
    });
  }

  try {

    //TODO: will move this check for the action into a new auth middleware 
    // because we need it to verify the user's roles. Also use it to add the 
    // file_id into the request if it already exists

    //Check if file already exists
    console.log("Checking if file exists...");
    fileData = await databaseQuery( "SELECT * FROM `file` WHERE bucket_id = ? AND file_name = ?", [bucket_name, uploadedFileName])
    // await connection.query(
    //   "SELECT * FROM `file` WHERE bucket_id = ? AND file_name = ?",
    //   [bucket_name, uploadedFileName],
    //   function (error, results) {
    //     if (error) {
    //       console.log(error);
    //       res.status(500).send({
    //         message: "There was an error connecting to the database: ",
    //         error,
    //       });
    //     }
    //     console.log("Database query successful: ", results);
    //     fileData = results;
    //     console.log("result length: ", fileData.length);
    //   }
    // );

    let action = null;
    console.log("fileData", fileData);
    //TODO: organize this better into separate functions with try catches in each
    if(fileData === null || fileData.length === 0){
      action = Action.CREATE_FILE;
      console.log("Action is CREATE_FILE");
      createFile(uploadedFileName, metadata, bucket_name, user_id);

    }else {
      action = Action.UPDATE_FILE;
      console.log("Action is UPDATE_FILE");
      updateFile(uploadedFileName, metadata, bucket_name, fileData);
    }

    return res.status(201).json({
      bucket_name,
      message: "File uploaded and database insert successful.", //TODO: Make message say create or edit
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
  */
});

// Async function for handling insertion of file data in database.
// This should be called after the file is uploaded into a bucket.
// Commented out section of code is for handling file-specific roles-
//    if this functionality is needed, then need to pass user_id as
//    last parameter.
async function createFile(uploadedFileName, metadata, bucket_name) {
  try {
    let file_id = uuidv1();

    const insertRes = await databaseQuery(
      "INSERT INTO `file` VALUES (?, ?, ?, ?, ?, ?)",
      [
        file_id,
        bucket_name,
        uploadedFileName,
        metadata.generation,
        true,
        new Date(metadata.timeCreated),
      ]
    );
    console.log(
      "Database insert successful for file: ",
      file_id,
      bucket_name,
      uploadedFileName
    );

    return insertRes;

    // connection.query(
    //   "INSERT INTO `file` VALUES (?, ?, ?, ?, ?, ?)",
    //   [file_id, bucket_name, uploadedFileName, metadata.generation, true, new Date(metadata.timeCreated)],
    //   function (error, results) {
    //     if (error) {
    //       console.log("Database error: ", error);
    //       return res.status(500).send({
    //         message: "There was an error connecting to the database: ",
    //         error,
    //       });
    //     }
    //     console.log("Database insert successful for file: ", file_id, bucket_name, uploadedFileName);
    //   }
    // );

    // await databaseQuery("INSERT INTO `file_user` VALUES (?, ?, ?)", [
    //   file_id,
    //   user_id,
    //   FileRole.FILE_OWNER.string,
    // ]);
    // console.log(
    //   "Database insert successful for user file role ",
    //   user_id,
    //   file_id,
    //   FileRole.FILE_OWNER.string
    // );

    // connection.query(
    //   "INSERT INTO `file_user` VALUES (?, ?, ?)",
    //   [file_id, user_id, FileRole.FILE_OWNER.string],
    //   function (error, results) {
    //     if (error) {
    //       console.log("Database error: ", error);
    //       return res.status(500).send({
    //         message: "There was an error connecting to the database: ",
    //         error,
    //       });
    //     }
    //     console.log("Database insert successful for user file role ", user_id, file_id, FileRole.FILE_OWNER.string );
    //   }
    // );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
}

async function updateFile(uploadedFileName, metadata, bucket_name, fileData) {
  try {
    let file_id = fileData[0].file_id;
    //update file table: make isActive false for existing rows for this file
    //insert new row with isActive=true

    await databaseQuery(
      "UPDATE `file` SET isActive = false WHERE file_id = ? and isActive = true",
      [file_id]
    );
    console.log("Database update successful");

    // connection.query(
    //   "UPDATE `file` SET isActive = false WHERE file_id = ? and isActive = true",
    //   [file_id],
    //   function (error, results) {
    //     if (error) {
    //       console.log("Database error: ", error);
    //       return res.status(500).send({
    //         message: "There was an error connecting to the database: ",
    //         error,
    //       });
    //     }
    //     console.log("Database update successful");
    //   }
    // );

    await databaseQuery("INSERT INTO `file` VALUES (?, ?, ?, ?, ?, ?)", [
      file_id,
      bucket_name,
      uploadedFileName,
      metadata.generation,
      true,
      new Date(metadata.timeCreated),
    ]);
    console.log(
      "Database insert successful for file ",
      file_id,
      bucket_name,
      uploadedFileName
    );

    // connection.query(
    //   "INSERT INTO `file` VALUES (?, ?, ?, ?, ?, ?)",
    //   [file_id, bucket_name, uploadedFileName, metadata.generation, true, new Date(metadata.timeCreated)],
    //   function (error, results) {
    //     if (error) {
    //       console.log("Database error: ", error);
    //       return res.status(500).send({
    //         message: "There was an error connecting to the database: ",
    //         error,
    //       });
    //     }
    //     console.log("Database insert successful for file ", file_id, bucket_name, uploadedFileName);
    //   }
    // );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
}

function databaseQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        console.log("Database error: ", err);
        reject(err);
      }
      console.log("Query results: ", results);
      resolve(results);
    });
  });
}

export default uploadsRouter;

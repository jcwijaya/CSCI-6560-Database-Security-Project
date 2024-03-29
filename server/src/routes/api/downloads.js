import express from "express";
import connection from "../../services/database.js";
import storage from "../../configs/storage.config.js";
import auth from "../../middlewares/auth.js";
import roleAuth from "../../middlewares/roleAuth.js";
import downloader from "../../services/downloader.js";
import fileRoleAuth from "../../middlewares/fileRoleAuth.js";

const downloadsRouter = express.Router();

// @route    GET api/downloads/download-file
// @desc     download file from bucket ("read")
// @access   PRIVATE
/* body parameters: 
{
  file_id
  bucket_name
  destPath: full path for destination folder- must include trailing slash
  version?: unique version identifier for a file. Only needed if 
    user is trying to download inactive version of a file.
}
*/

//TODO: Route through roleAuth middleware once uploads im"desaplemented-
//  potentially will have separate role authorization middleware
//  whenever target user not involved, like in this case.
downloadsRouter.get("/download-file", auth, fileRoleAuth, async (req, res) => {
  // get necessary body parameters- only need version if user is trying
  // to download inactive version of a file
  let version = req.body?.version;
  const { file_id, bucket_name, destPath } = req.body;

  if (!destPath)
    return res.status(400).json({
      msg: "Bad request- please provide destination path.",
    });

  // Query database to check for validity
  let query, valuesArr;
  if (version) {
    query =
      "SELECT * FROM file WHERE file_id= ? AND bucket_id = ? AND version = ?";
    valuesArr = [file_id, bucket_name, version];
  } else {
    query =
      "SELECT * FROM file WHERE file_id=? AND bucket_id = ? and isActive = 1";
    valuesArr = [file_id, bucket_name];
  }
  connection.query(query, valuesArr, async (error, results) => {
    if (error) throw error;

    if (results.length < 1 || results.length > 2)
      return res.status(400).json({
        errors: [
          {
            msg: "Bad request- invalid number of results received.",
          },
        ],
      });

    console.log("Download possible. Results:");
    console.log(results);
    const fileName = results[0].file_name;

    try {
      await downloader(bucket_name, fileName, destPath);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        msg: "Bad request- please check destination path.",
      });
    }
    return res.status(201).json({
      results,
    });
  });
});

export default downloadsRouter;

import express from "express";
import connection from "../../services/database.js";
import storage from "../../configs/storage.config.js";
import auth from "../../middlewares/auth.js";
import roleAuth from "../../middlewares/roleAuth.js";
import downloader from "../../services/downloader.js";

const downloadsRouter = express.Router();

// @route    GET api/downloads
// @desc     download file from bucket ("read")
// @access   PRIVATE
/* body parameters: 
{
  file_id
  bucket_id
  version?: unique version identifier for a file. Only needed if 
    user is trying to download inactive version of a file.
}
*/

//TODO: Route through roleAuth middleware once uploads implemented-
//  potentially will have separate role authorization middleware
//  whenever target user not involved, like in this case.
downloadsRouter.get("/", auth, async (req, res) => {
  // get necessary body parameters- only need version if user is trying
  // to download inactive version of a file
  let version = req.body?.version;
  const { file_id, bucket_id } = req.body;

  // Query database to check for validity
  let query, valuesArr;
  if (version) {
    query =
      "SELECT * FROM file WHERE file_id= ? AND bucket_id = ? AND version = ?";
    valuesArr = [file_id, bucket_id, version];
  } else {
    query =
      "SELECT * FROM file WHERE file_id=? AND bucket_id = ? and isActive = 1";
    valuesArr = [file_id, bucket_id];
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

    await downloader(
      bucket_id,
      fileName,
      "C:\\Users\\krdub\\Downloads\\" + fileName
    );

    return res.status(201).json({
      results,
    });
  });

  // TODO: Call downloader service to download file from bucket
});

export default downloadsRouter;

import { BucketRole } from "../models/enums/Roles.js";
import connection from "../services/database.js";

const roleAuth = async (action, user_id, bucket_id, fileName) => {
  //use action to determine whether we need to check one or both tables for permissions
  try {
    let role = null;
    let requiredRole = null;
    if (Object.keys(action).includes("fileRole")) {
      //query db for user's role for file
      await connection.query(
        "SELECT * FROM `file_user` WHERE file_name = ? AND bucket_id = ? AND user_id = ?",
        [fileName, bucket_id, user_id],
        function (error, results) {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log("Database query successful: ", results);
          role = FileRole[results[0].file_role];
        }
      );
      requiredRole = action.fileRole;
    } else {
      //query db for user's role for bucket
      await connection.query(
        "SELECT * FROM `bucket_user` WHERE bucket_id = ? AND user_id = ?",
        [bucket_id, user_id],
        function (error, results) {
          if (error) {
            console.log(error);
            throw error;
          }
          console.log("Database query successful: ", results);
          role = BucketRole[results[0].bucket_role];
        }
      );
      requiredRole = action.bucketRole;
    }

    return role.value >= requiredRole.value ? true : false;
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          msg: `Error occurred while authorizing action ${action} for user ${user_id}, error: ${err}`,
        },
      ],
    });
  }
};

// TODO: Finish refactor for middleware compatibility
const roleAuth_ = async (req, res, next) => {
  if (!req.body.bucket_id || !req.body.action)
    return res.status(400).json({
      errors: [
        {
          msg: "Bucket id and action must be provided for role authorization.",
        },
      ],
    });
};

export default roleAuth;

import jwt from "jsonwebtoken";
import secret from "../configs/secret.config.js";
import { BucketRole } from "../models/enums/Roles.js";
import connection from "../services/database.js";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ errors: [{ msg: "No token, authorization denied." }] });

  try {
    const decoded = jwt.verify(token, secret);
    //console.log(decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ errors: [{ msg: "Invalid token, authorization denied." }] });
  }
};

export const authorize = async (action, user_id, bucket_id, fileName ) => {
//use action to determine whether we need to check one or both tables for permissions
  try {
    let role = null;
    let requiredRole = null;
    if(Object.keys(action).includes("fileRole")){
      //query db for user's role for file
      await connection.query(
        "SELECT * FROM `file_user` WHERE file_name = ? AND bucket_id = ? AND user_id = ?",
        [fileNname, bucket_id, user_id],
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
    }
    else{
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
    res
      .status(401)
      .json({ errors: [{ msg: `Error occurred while authorizing action ${action} for user ${user_id}, error: ${err}` }] });
  }
};

export default auth;

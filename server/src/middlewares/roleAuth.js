import { BucketRole, FileRole } from "../models/enums/Roles.js";
import { Action } from "../models/enums/Actions.js";
import connection from "../services/database.js";

// Middleware for bucket role verification-
// use for any endpoint that needs to verify
// a user's bucket role
const roleAuth = async (req, res, next) => {
  // Must know bucket for which to get user role
  if (!req.body.bucket_id)
    return res.status(400).json({
      errors: [
        {
          msg: "Bucket id must be provided for role authorization.",
        },
      ],
    });

  // derive action from request and get permission value
  const action = req.method + req.url;
  console.log(action);
  let requiredRole;
  switch (action) {
    case Action.ASSIGN_BUCKET_ROLE.endpoint:
      console.log("Action matches assign bucket role endpoint");
      requiredRole = Action.ASSIGN_BUCKET_ROLE.bucketRole.value;
      break;
  }
  console.log(
    `The minimum role requirement is ${requiredRole}- now need to check user role in DB.`
  );

  // query database to get role
  // TODO: implement once we start using file roles
  try {
    let role = null;
    // if a fileName was included, also need to check file role
    /*
    if (req.body.fileName) {
      //query db for user's role for file
      await connection.query(
        "SELECT * FROM `file_user` WHERE file_name = ? AND bucket_id = ? AND user_id = ?",
        [req.body.fileName, bucket_id, user_id],
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
    } else {}
      */

    //query db for user's role for bucket
    await connection.query(
      "SELECT * FROM `bucket_user` WHERE bucket_id = ? AND user_id = ?",
      [req.body.bucket_id, req.user.user_id],
      function (error, results) {
        if (error) {
          throw error;
        }
        if (results.length !== 1)
          return res.status(400).json({
            errors: [
              {
                msg: "Bad request- no role result received.",
              },
            ],
          });
        console.log("Database query successful: ", results);
        role = BucketRole[results[0].bucket_role];
        console.log(role);
        if (role.value >= requiredRole) {
          console.log("Bucket role verified- action approved.");
          next();
        } else {
          return res.status(403).json({
            errors: [
              {
                msg: `Unauthorized to perform bucket action.`,
              },
            ],
          });
        }
      }
    );
  } catch (err) {
    return res.status(401).json({
      errors: [
        {
          msg: `Error occurred while authorizing action ${action} for user ${req.user.user_id}, error: ${err}`,
        },
      ],
    });
  }
};

export default roleAuth;

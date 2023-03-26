import { BucketRole, FileRole } from "../models/enums/Roles.js";
import { Action } from "../models/enums/Actions.js";
import connection from "../services/database.js";

// Middleware for any endpoint that needs to verify a user's bucket role.
// Must be used after regular auth middleware.
// Queries database to determine if user role is >= role requirement for action.
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
  const actionEndpoint = req.method + req.url;

  // Catch errors with assigning or updating bucket roles.
  if (
    actionEndpoint === Action.ASSIGN_BUCKET_ROLE.endpoint ||
    actionEndpoint === Action.UPDATE_BUCKET_ROLE.endpoint
  ) {
    // Error if left out target user or role
    if (!req.body.targetUserId || !req.body.targetRole) {
      return res.status(400).json({
        errors: [
          {
            msg: "Must provide target role and target user when attempting to edit bucket role.",
          },
        ],
      });
    }

    // Error if attempting to edit own role
    if (req.body.targetUserId === req.user.user_id)
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid role modification attmept-cannot directly change own role.",
          },
        ],
      });
  }

  // Query to obtain roles for BOTH requesting user and target user for bucket
  // If assigning, only requesting user should have Id for the bucket, and it should be at least a maintainer
  // If updating, both users should have Id in bucket.
  // set reqUserRole and targetUserRole

  await connection.query(
    "SELECT user_id, bucket_role FROM `bucket_user` WHERE user_id = ? OR user_id = ? AND bucket_id = ?",
    [req.user.user_id, req.body.targetUserId, req.body.bucket_id],
    function (error, results) {
      if (error) {
        return res.status(500).json({
          errors: [
            {
              msg: "Database query error.",
            },
          ],
        });
      }
      if (results.length < 1 || results.length > 2)
        return res.status(400).json({
          errors: [
            {
              msg: "Bad request- invalid number of results received.",
            },
          ],
        });
      console.log("Database query successful: ", results);
      //return res.status(200).json(results);

      // Check results- get role of requesting user and target user
      let reqUserRole,
        targetUserRole = null;
      results.forEach((result) => {
        if (result.user_id === req.user.user_id) {
          reqUserRole = BucketRole[result.bucket_role].value;
        } else if (
          req.body.targetUserId &&
          result.user_id === req.body.targetUserId
        ) {
          targetUserRole = BucketRole[result.bucket_role].value;
        }
      });

      console.log(`Requesting user's role in the bucket is ${reqUserRole}`);
      console.log(
        `Target user's role in the bucket is ${
          targetUserRole ? targetUserRole : "NULL"
        }`
      );

      // Based on action, requesting user role, and target user role (if applies)-
      // check if authorization should be granted
      let requiredRole;
      switch (actionEndpoint) {
        /* In case of trying to add user or edit user- agnostic at this point as to
        whether or not maintainer status involved for target user.*/
        case Action.ASSIGN_BUCKET_ROLE.endpoint:
        case Action.UPDATE_BUCKET_ROLE.endpoint:
          // Check if user attempting to modify maintainer's role
          // OR make a user a maintainer
          if (targetUserRole === BucketRole.MAINTAINER.value) {
            requiredRole = Action.ASSIGN_MAINTAINER_ROLE.bucketRole.value;
          } else requiredRole = Action.ASSIGN_BUCKET_ROLE.bucketRole.value;
          console.log(
            `Attempt to add or modify user's role. Required role level is ${requiredRole}`
          );
          break;
      }

      if (requiredRole <= reqUserRole) {
        console.log("Bucket role verified- action approved.");
        /*
        return res
          .status(200)
          .json(
            `Requesting user approved to perform action ${actionEndpoint} with a role value of a ${reqUserRole} and a required role value of ${requiredRole}`
          );
          */
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

  /*
  // query database to get role
  // TODO: implement once we start using file roles
  try {
    let role = null;
    // if a fileName was included, also need to check file role
    
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
};

export default roleAuth;

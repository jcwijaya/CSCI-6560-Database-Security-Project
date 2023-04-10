import { BucketRole, FileRole } from "../models/enums/Roles.js";
import { Action } from "../models/enums/Actions.js";
import connection from "../services/database.js";
import { query } from "express";

// Middleware for any endpoint that needs to verify a user's bucket role.
// Unlike "fileRoleAuth" this is used for endpoints that involve a target user
// Must be used after regular auth middleware.
// Queries database to determine if user role is >= role requirement for action.
const roleAuth = async (req, res, next) => {
  console.log(req.user);
  console.log(req.body.targetUserId);
  // Must know bucket for which to get user role
  if (!req.body.bucket_name)
    return res.status(400).json({
      errors: [
        {
          msg: "Bucket name must be provided for role authorization.",
        },
      ],
    });
  const { bucket_name } = req.body;

  // derive action from request and get permission value
  const actionEndpoint = req.method + req.url;

  // Catch errors with assigning or updating bucket roles.
  if (
    actionEndpoint === Action.ASSIGN_BUCKET_ROLE.endpoint ||
    actionEndpoint === Action.UPDATE_BUCKET_ROLE.endpoint ||
    actionEndpoint === Action.REVOKE_BUCKET_ROLE.endpoint ||
    actionEndpoint === Action.REVOKE_MAINTAINER_ROLE.endpoint
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

  let query =
    "SELECT user_id, bucket_role, bucket_id FROM `bucket_user` WHERE (user_id = ? AND bucket_id = ?) OR (user_id = ? AND bucket_id = ?)";
  let params = [
    req.user.user_id,
    bucket_name,
    req.body.targetUserId,
    bucket_name,
  ];
  let queryResults = await databaseQuery(query, params);

  console.log("Results for user and target user's roles: ", queryResults);
  if (queryResults.length < 1 || queryResults.length > 2)
    return res.status(400).json({
      errors: [
        {
          msg: "Bad request- invalid number of results received.",
        },
      ],
    });

  let reqUserRole,
    targetUserRole = null;
  try {
    // Check results- get role of requesting user and target user

    queryResults.forEach((result) => {
      if (result.user_id === req.user.user_id) {
        reqUserRole = BucketRole[result.bucket_role].value;
      } else if (
        req.body.targetUserId &&
        result.user_id === req.body.targetUserId
      ) {
        //For updating role, if the target user already has the role we are trying to assign, then return error
        if (
          actionEndpoint !== Action.REVOKE_BUCKET_ROLE.endpoint &&
          actionEndpoint !== Action.REVOKE_MAINTAINER_ROLE.endpoint &&
          BucketRole[result.bucket_role].string === req.body.targetRole
        ) {
          console.log(
            `Target user has already been assigned the ${req.body.targetRole} for bucket ${req.body.bucket_name} `
          );
          throw new Error(
            `Target user has already been assigned the ${req.body.targetRole} for bucket ${req.body.bucket_name} `
          );
        }
        //For revoke role, if target user does not have the role we are trying to revoke, then return error too
        else if (
          (actionEndpoint === Action.REVOKE_BUCKET_ROLE.endpoint ||
            actionEndpoint === Action.REVOKE_MAINTAINER_ROLE.endpoint) &&
          BucketRole[result.bucket_role].string !== req.body.targetRole
        ) {
          let errorString = `Target user role ${
            BucketRole[result.bucket_role].string
          } found in database does not match role being revoked ${
            req.body.targetRole
          } for bucket ${req.body.bucket_name} `;
          console.log(errorString);
          throw new Error(errorString);
        }
        targetUserRole = BucketRole[result.bucket_role].value;
      }
    });
  } catch (err) {
    return res.status(400).json({
      errors: err.message,
    });
  }

  console.log(`Requesting user's role in the bucket is ${reqUserRole}`);
  console.log(`Target user's role in the bucket is ${targetUserRole}`);

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
      if (
        targetUserRole === BucketRole.MAINTAINER.value ||
        req.body.targetRole === BucketRole.MAINTAINER.value
      ) {
        requiredRole = Action.ASSIGN_MAINTAINER_ROLE.bucketRole.value;
      } else requiredRole = Action.ASSIGN_BUCKET_ROLE.bucketRole.value;
      console.log(
        `Attempt to add or modify user's role. Required role level is ${requiredRole}`
      );
      break;
    case Action.REVOKE_BUCKET_ROLE.endpoint:
      requiredRole = Action.REVOKE_BUCKET_ROLE.bucketRole.value;
      console.log(
        `Attempt to revoke user's role. Required role level is ${Action.REVOKE_BUCKET_ROLE.bucketRole.string}`
      );
      break;
    case Action.REVOKE_MAINTAINER_ROLE.endpoint:
      requiredRole = Action.REVOKE_MAINTAINER_ROLE.bucketRole.value;
      console.log(
        `Attempt to revoke maintainer's role. Required role level is ${Action.REVOKE_MAINTAINER_ROLE.bucketRole.string}`
      );
      break;
  }
  if (requiredRole <= reqUserRole) {
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

export default roleAuth;

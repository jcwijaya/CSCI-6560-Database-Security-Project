import connection from "../services/database.js";
import { Action } from "../models/enums/Actions.js";
import { BucketRole } from "../models/enums/Roles.js";

// Middleware for any endpoint that needs to verify a user's bucket role.
// Unlike "roleAuth" this is for endpoints that do not involve a target user
// Must be used after regular auth middleware.

// Queries database to determine if user role is >= role requirement for action.
const fileRoleAuth = async (req, res, next) => {
  // obtain user id attached to req from auth middleware
  const { user_id } = req.user;

  // Must know bucket for which to get user role
  if (!req.body.bucket_name)
    return res.status(400).json({
      errors: [
        {
          msg: "Bucket id must be provided for role authorization.",
        },
      ],
    });
  const { bucket_name } = req.body;

  // derive action from request and get permission value
  const actionEndpoint = req.method + req.url;

  // query database to get requesting user's role
  const query = "SELECT * FROM bucket_user WHERE user_id = ? AND bucket_id = ?";
  const valuesArr = [user_id, bucket_name];
  await connection.query(query, valuesArr, (error, results) => {
    if (error) {
      return res.status(500).json({
        errors: [
          {
            msg: "Database query error.",
          },
        ],
      });
    }
    console.log(results);
    if (results.length !== 1) {
      return res.status(400).json({
        errors: [
          {
            msg: `User's role not found in bucket ${bucket_name}`,
          },
        ],
      });
    }

    const role = BucketRole[results[0].bucket_role].value;
    let requiredRole;
    switch (actionEndpoint) {
      case Action.CREATE_FILE.endpoint:
        requiredRole = Action.CREATE_FILE.bucketRole.value;
        break;
      case Action.VIEW_FILE.endpoint:
        requiredRole = Action.VIEW_FILE.bucketRole.value;
        break;
      case Action.UPDATE_FILE.endpoint:
        requiredRole = Action.UPDATE_FILE.bucketRole.value;
        break;
      case Action.SOFT_DELETE_FILE.endpoint:
        requiredRole = Action.SOFT_DELETE_FILE.bucketRole.value;
        break;
      default:
        return res.status(500).json({
          msg: "Uknown action.",
        });
    }
    console.log("db results for role: ", results[0].bucket_role);
    console.log("Role: ", role);
    console.log("Required role: ", requiredRole);
    
    if (role < requiredRole) {
      return res.status(403).json({
        msg: "Unauthorized to perform file action",
      });
    }
    next();
  });
};

export default fileRoleAuth;

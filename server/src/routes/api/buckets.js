import express from "express";
import createBucket from "../../services/bucketCreator.js";
import connection from "../../services/database.js";
import auth from "../../middlewares/auth.js";
import roleAuth from "../../middlewares/roleAuth.js";
import { BucketRole } from "../../models/enums/Roles.js";

const bucketsRouter = express.Router();

// Use service "bucketCreator" to create a new bucket with identifier specified
// by req.body.bucket_name
bucketsRouter.post("/", auth, async (req, res) => {
  const bucket_name = req.body.bucket_name;
  const user_id = req.user.user_id;
  if (user_id == null || bucket_name == null) {
    console.log("missing header or bucket_name");
    return res.status(500).json({ error: "missing user_id or bucket_name" });
  }

  try {
    console.log(`User attempted to create bucket ${bucket_name}`);
    await createBucket(bucket_name);
  } catch (err) {
    console.log(err);
    if (err.code === 409) {
      return res.status(400).json({
        message: "Bucket name unavailable- please choose a different name.",
      });
    } else console.log("500 error: ");
    return res.status(500).json({
      errors: err.errors,
    });
  }

  try {
    connection.query(
      "INSERT INTO bucket_user VALUES (?, ?, ?)",
      [bucket_name, user_id, BucketRole.OWNER.string],
      function (error, results) {
        if (error) {
          console.log("Database error: ", error);
          //TODO: when trying to create bucket with nonexistent user_id it says successful when it is not
          return res.status(500).send({
            message: "There was an error connecting to the database: ",
            error,
          });
        }
        console.log("Database insert successful: ", user_id);
        // res.status(200).json({user_id: user_id, results: results});
      }
    );

    return res.status(201).json({
      bucket_name,
      message: "Bucket created and database insert successful.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//Get all buckets in Db (all rows where role is OWNER, each bucket will have only one owner)
bucketsRouter.get("/", function (req, res) {
  connection.query(
    "SELECT * FROM bucket_user WHERE bucket_role = ?",
    BucketRole.OWNER.string,
    function (error, results) {
      if (error) {
        console.log(error);
        res.status(500).send({
          message: "There was an error connecting to the database: ",
          error,
        });
      }
      console.log("Database query successful: ", results);
      res.status(200).json(results);
    }
  );
});

//Get all user's bucket_roles (everything in bucket_user table)
bucketsRouter.get("/bucket-roles", function (req, res) {
  connection.query("SELECT * FROM `bucket_user`", function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send({
        message: "There was an error connecting to the database: ",
        error,
      });
    }
    console.log("Database query successful: ", results);
    res.status(200).json(results);
  });
});

// @route    POST api/buckets/bucket-roles
// @desc     add user to bucket with specific role
// @access   PRIVATE
/* body parameters: 
{
  bucket_name: unique identifying name of bucket,
  targetUserId: user_id in db that uniquely identifies user,
  targetRole: string identifying new role for specified user (see models/enums/roles)
}
*/
bucketsRouter.post("/bucket-roles", auth, roleAuth, async (req, res) => {
  const { bucket_name, targetUserId, targetRole } = req.body;

  if (!bucket_name || !targetUserId || !targetRole) {
    return res.status(400).json({
      errors: [
        {
          msg: "Bad request- please provide required information.",
        },
      ],
    });
  }

  const query =
    "INSERT INTO bucket_user(bucket_id, user_id, bucket_role) VALUES(?, ?, ?)";
  const valuesArr = [bucket_name, targetUserId, targetRole];
  await connection.query(query, valuesArr, (error, results) => {
    if (error) throw error;
    console.log(results);
  });
  return res.status(201).json(results);
});

// @route    PATCH api/buckets/bucket-roles
// @desc     update user role in specific bucket
// @access   PRIVATE
/* body parameters: 
{
  bucket_name: unique identifying name of bucket,
  targetUserId: user_id in db that uniquely identifies user,
  targetRole: string identifying new role for specified user (see models/enums/roles)
}
*/
bucketsRouter.patch("/bucket-roles", auth, roleAuth, async (req, res) => {
  const { bucket_name, targetUserId, targetRole } = req.body;

  if (!bucket_name || !targetUserId || !targetRole) {
    return res.status(400).json({
      errors: [
        {
          msg: "Bad request- please provide required information.",
        },
      ],
    });
  }

  const query =
    "UPDATE bucket_user SET bucket_role = ? WHERE bucket_id = ? AND user_id = ? ";
  const valuesArr = [targetRole, bucket_name, targetUserId];
  await connection.query(query, valuesArr, (error, results) => {
    if (error) throw error;
    console.log(results);
    return res.status(201).json(results);
  });
});

export default bucketsRouter;

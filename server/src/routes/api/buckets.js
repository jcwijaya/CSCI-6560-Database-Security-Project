import express from "express";
import createBucket from "../../services/bucketCreator.js";
import connection from "../../services/database.js";

const bucketsRouter = express.Router();

// Use service "bucketCreator" to create a new bucket with identifier specified
// by req.body.bucket_name
bucketsRouter.post("/", async (req, res) => {
  const bucket_name = req.body.bucket_name;
  const user_id = req.headers.user_id;
  if(user_id == null || bucket_name == null ){
    console.log("missing header or bucket_name");
    return res.status(500).json({ error: "missing user_id or bucket_name" });
  }

  try{
      console.log(`User attempted to create bucket ${bucket_name}`);
      await createBucket(bucket_name);
  }catch(err){
      console.log(err);
      if (err.code === 409) {
        return res
          .status(400)
          .json({
            message: "Bucket name unavailable- please choose a different name.",
          });
      } else
      console.log("500 error: ");
        return res.status(500).json({
          errors: err.errors,
        });
    }
    
   try{
    connection.query(
      "INSERT INTO bucket_user VALUES (?, ?, ?)", [bucket_name, user_id, "OWNER"],
      function(error, results) {
        if(error){
          console.log("Database error: ", error);
          //TODO: when trying to create bucket with nonexistent user_id it says successful when it is not
          return res.status(500).send({message:"There was an error connecting to the database: ", error });
        }
        console.log("Database insert successful: ", user_id);
       // res.status(200).json({user_id: user_id, results: results});
      }
  );

  return res.status(201).json({
    bucket_name,
    message: "Bucket created and database insert successful."
  });

   }catch(err){
      console.log(err);
      return res.status(500).json({ error: err });
   }

});

//Get all buckets in Db (all rows where role is OWNER, each bucket will have only one owner)
bucketsRouter.get("/", function(req, res) {
  connection.query(
    "SELECT * FROM bucket_user WHERE bucket_role = ?", "OWNER",
       function(error, results) {
        if(error){
            console.log(error);
            res.status(500).send({message:"There was an error connecting to the database: ", error });
          }
          console.log("Database query successful: ", results)
          res.status(200).json(results);
      }
  );
});

 //Get all user's bucket_roles (everything in bucket_user table)
bucketsRouter.get("/bucket-roles", function(req, res) {
   connection.query(
     "SELECT * FROM `bucket_user`",
     function(error, results) {
       if(error){
         console.log(error);
         res.status(500).send({message:"There was an error connecting to the database: ", error });
       }
       console.log("Database query successful: ", results)
       res.status(200).json(results);
     }
   );
 });

export default bucketsRouter;

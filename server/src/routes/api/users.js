import express from "express";
import { v1 as uuidv1 } from "uuid";
import bcrypt from "bcrypt";
const saltRounds = 10;
import connection from "../../services/database.js";
import auth from "../../middlewares/auth.js";

const usersRouter = express.Router();

//Insert a new row into the user table. Request body must contain a password and full name at minimum
//The user_id is generated right here and the password is encrypted before being stored in the DB.
usersRouter.post("/", async function (req, res) {
  const { password, first_name, last_name, email, phone_number } = req.body;
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  let user_id = uuidv1();
  connection.query(
    "INSERT INTO user (user_id, password, first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)",
    [user_id, encryptedPassword, first_name, last_name, email, phone_number],
    function (error, results) {
      if (error) {
        console.log(error);
        res.status(500).send({
          message: "There was an error connecting to the database: ",
          error,
        });
      }
      console.log("Database insert successful: ", user_id);
      res.status(200).json({ user_id: user_id, results: results });
    }
  );
});

//Get a user's information using the id that was returned from the POST /user
usersRouter.get("/:user_id", auth, async function (req, res) {
  if (req.user.user_id !== req.params.user_id)
    return res.status(401).json({ errors: [{ msg: "Action unauthorized" }] });
  await connection.query(
    "SELECT * FROM `user` WHERE user_id = ?",
    req.params.user_id,
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

//Get all users
usersRouter.get("/", function (req, res) {
  connection.query("SELECT * FROM `user`", function (error, results) {
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

//Delete user
usersRouter.delete("/:user_id", auth, async function (req, res) {
  if (req.user.user_id !== req.params.user_id)
    return res.status(401).json({ errors: [{ msg: "Action unauthorized" }] });
  connection.query(
    "DELETE FROM `user` WHERE user_id = ?",
    [req.user.user_id],
    function (error, results) {
      if (error) {
        console.log(error);
        res.status(500).send({
          message: "There was an error connecting to the database: ",
          error,
        });
      }
      console.log("User deleted successfully: ", results);
      res.status(200).json({ results, message: "User deleted successfully" });
    }
  );
});

export default usersRouter;

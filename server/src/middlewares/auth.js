import jwt from "jsonwebtoken";
import secret from "../configs/secret.config.js";

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

export default auth;

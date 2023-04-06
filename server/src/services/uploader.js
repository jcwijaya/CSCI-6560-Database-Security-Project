import gc from "../configs/storage.config.js";
import { format } from "util";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

//const bucket = gc.bucket(process.env.BUCKET_ID);

const uploader = (bucket_id, file) =>
  new Promise((resolve, reject) => {
    const bucket = gc.bucket(bucket_id);
    if (!file) reject("No file received");
    console.log(file);
    const { originalname, buffer } = file;

    const blob = bucket.file(originalname.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on("error", (err) => {
        console.log(err);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

export default uploader;

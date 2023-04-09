import gc from "../configs/storage.config.js";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const deleteFile = (bucket_id, fileName) =>
  new Promise( (resolve, reject) => {
    console.log("attempting to delete file...")
    const bucket = gc.bucket(bucket_id);
    if (!fileName || !bucket_id) reject("File name or bucket name is missing");
    console.log(fileName);
    try{
         bucket.file(fileName).delete().then(result => result[0]);
        console.log(`Deletion successful for file: ${fileName} in bucket: ${bucket_id}`);
        resolve(metadata);
    }
    catch(err){
        console.log(`Error occurred when deleting file: ${fileName} in bucket: ${bucket_id}, `, err);
        reject(err);
    }
  });

export default deleteFile;

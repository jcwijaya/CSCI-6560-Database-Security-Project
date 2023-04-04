import gc from "../configs/storage.config.js";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();


const getMetadata = (bucket_id, fileName) =>
  new Promise( (resolve, reject) => {
    console.log("retrieving metadata...")
    const bucket = gc.bucket(bucket_id);
    if (!fileName) reject("No file name received");
    console.log(fileName);
    try{
        const metadata = bucket.file(fileName).getMetadata()
          .then(result => result[0]);
        console.log("Metadata returned: ", metadata);
        resolve(metadata);
    }
    catch(err){
        console.log("Error when fetching file metadata: ", err);
        reject(err);
    }
  });

export default getMetadata;

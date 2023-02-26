import Cloud from "@google-cloud/storage";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const serviceKey = path.join(__dirname, "./key.json");

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  //projectId: process.env.BUCKET_ID,
});

export default storage;

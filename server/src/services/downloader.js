import storage from "../configs/storage.config.js";

// download service for google cloud storage
// generation number can be provided to download inactive version of file
const downloader = async (
  bucketName,
  fileName,
  destFileName,
  generation = null
) => {
  // all params required
  if (!bucketName || !fileName || !destFileName) {
    throw new Error({
      msg: "please provide bucket name, file name, and destination",
    });
  }

  const options = {
    destination: destFileName,
  };

  // download file
  await storage.bucket(bucketName).file(fileName).download(options);

  console.log(`gs://${bucketName}/${fileName} downloaded to ${destFileName}.`);
};

export default downloader;

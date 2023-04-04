import storage from "../configs/storage.config.js";
import { BucketOption } from "../models/enums/BucketOptions.js";

const { LOCATION, STORAGECLASS, AUTOCLASS, VERSIONING } = BucketOption;

const createBucket = async (name) => {
  if (name === "" || name.indexOf(" ") >= 0) throw new Error("Invalid name");
  const [bucket] = await storage.createBucket(name, {
    location: LOCATION,
    storageClass: STORAGECLASS,
    autoclass: AUTOCLASS,
    versioning: {
      enabled: true,
    },
  });

  console.log(bucket);
  return {
    success: true,
    bucket,
  };
  /*  
} catch (err) {
    console.log(err.errors);
    return {
      success: false,
      message: error.errors.message,
    };
  }
  */
};

export default createBucket;

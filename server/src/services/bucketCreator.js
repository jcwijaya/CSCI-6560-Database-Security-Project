import storage from "../configs/storage.config.js";

const createBucket = async (name) => {
  if (name === "" || name.indexOf(" ") >= 0) throw new Error("Invalid name");
  const [bucket] = await storage.createBucket(name);
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

//Refer to https://cloud.google.com/storage/docs/access-control/create-manage-lists#storage-set-acls-nodejs
//For more info on the code in here.
//For other samples, look to https://github.com/googleapis/nodejs-storage/tree/d05234ef45fbfab6e08f0149c0952fb511f72ae4/samples
//and also https://cloud.google.com/nodejs/docs/reference/storage/latest


//We will need the 1st section to add users to an ACL if they are authorized and need access.
//For the second part we can discuss what default ACL we want to apply. Base case would be restric everything to only the user who created it,
// But I think it makes more sense to default acl access for anyone with the same privelages as the creator.
// The ID of your GCS bucket
const bucketName = 'sampleBucket';

// The email address of the user to add
 const userEmail = 'sampleuser@gmail.com'; //query db for current user email, or can assign statically like now


// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

async function addBucketOwner() {
  // Makes the user an owner of the bucket. You can use addAllUsers(),
  // addDomain(), addProject(), addGroup(), and addAllAuthenticatedUsers()
  // to grant access to different types of entities. You can also use "readers"
  // and "writers" to grant different roles.
  await storage.bucket(bucketName).acl.owners.addUser(userEmail);
  

  console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
}

addBucketOwner().catch(console.error);

//To add ACL to a file

// The name of the file to access
const fileName = 'samplefile.txt';

/* Remember to always load the library, and use the user's email. We have those from above, but if we separate these 
//Remember to include them!
// const userEmail = 'sampleuser@gmail.com';
//const {Storage} = require('@google-cloud/storage');
// Creates a client
//const storage = new Storage();
*/

async function addFileOwner() {
  await storage
    .bucket(bucketName)
    .file(fileName)
    .acl.owners.addUser(userEmail);

  console.log(`Added user ${userEmail} as an owner on file ${fileName}.`);
}

addFileOwner().catch(console.error);


async function addBucketDefaultOwner() {
  
  await storage.bucket(bucketName).acl.default.owners.addUser(userEmail);
  //very similar to call above, just uses default tag

  console.log(`Added user ${userEmail} as an owner on bucket ${bucketName}.`);
}

addBucketDefaultOwner().catch(console.error);

//to remove default from BUCKET 

async function removeBucketDefaultOwner() {
    // Removes the user from the access control list of the bucket. You can use
    // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
    // deleteAllAuthenticatedUsers() to remove access for different types of entities.
    await storage.bucket(bucketName).acl.default.owners.deleteUser(userEmail);
  
    console.log(`Removed user ${userEmail} from bucket ${bucketName}.`);
  }
  
  removeBucketDefaultOwner().catch(console.error)


//To remove default for FILE
async function removeFileOwner() {
    // Removes the user from the access control list of the file. You can use
    // deleteAllUsers(), deleteDomain(), deleteProject(), deleteGroup(), and
    // deleteAllAuthenticatedUsers() to remove access for different types of entities.
    await storage
      .bucket(bucketName)
      .file(fileName)
      .acl.owners.deleteUser(userEmail);
  
    console.log(`Removed user ${userEmail} from file ${fileName}.`);
  }
  
  removeFileOwner().catch(console.error);


  //Check the acl for a bucket 
  async function printBucketAcl() {
    // Gets the ACL for the bucket
    const [acls] = await storage.bucket(bucketName).acl.get();
  
    acls.forEach(acl => {
      console.log(`${acl.role}: ${acl.entity}`);
    });
  }
  printBucketAcl().catch(console.error);

  //get the acl for an OBJECT
  async function printFileAcl() {
    // Gets the ACL for the file
    const [acls] = await storage.bucket(bucketName).file(fileName).acl.get();
  
    acls.forEach(acl => {
      console.log(`${acl.role}: ${acl.entity}`);
    });
  }
  
  printFileAcl().catch(console.error);
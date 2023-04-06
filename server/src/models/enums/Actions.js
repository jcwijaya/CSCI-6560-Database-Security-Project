import { BucketRole, FileRole } from "./Roles.js";

//This enum defines the relationship between an action and the minimum access
// role required to do it.
export const Action = {
  //View list of files in a bucket
  VIEW_FILES_IN_BUCKET: {
    bucketRole: BucketRole.VIEWER,
  },
  VIEW_FILE: {
    bucketRole: BucketRole.VIEWER,
    fileRole: FileRole.FILE_VIEWER,
    endpoint: "GET/download-file",
  },
  CREATE_FILE: {
    bucketRole: BucketRole.RESTRICTED_EDITOR,
    endpoint: "POST/upload-file",
  },
  UPDATE_FILE: {
    bucketRole: BucketRole.EDITOR,
    fileRole: FileRole.FILE_EDITOR,
    endpoint: "POST/upload-file",
  },
  SOFT_DELETE_FILE: {
    bucketRole: BucketRole.MAINTAINER,
    fileRole: FileRole.FILE_OWNER,
  },
  CHANGE_FILE_VERSION: {
    bucketRole: BucketRole.MAINTAINER,
    fileRole: FileRole.FILE_EDITOR,
  },
  //Permanently delete file
  DELETE_FILE: {
    bucketRole: BucketRole.OWNER,
    fileRole: FileRole.FILE_OWNER,
  },
  //Assign bucket role below MAINTAINER or file role below FILE_OWNER to user
  ASSIGN_BUCKET_ROLE: {
    bucketRole: BucketRole.MAINTAINER,
    endpoint: "POST/bucket-roles",
  },
  //Update bucket role for user already participating in the bucket
  UPDATE_BUCKET_ROLE: {
    bucketRole: BucketRole.MAINTAINER,
    endpoint: "PATCH/bucket-roles",
  },
  //Revoke bucket role below MAINTAINER or file role below FILE_OWNER from user
  REVOKE_BUCKET_ROLE: {
    bucketRole: BucketRole.MAINTAINER,
  },
  ASSIGN_MAINTAINER_ROLE: {
    bucketRole: BucketRole.OWNER,
    endpoint: "POST/bucket-roles",
  },
  //Update bucket role for user who is a maintainer already participating in the bucket
  UPDATE_MAINTAINER_ROLE: {
    bucketRole: BucketRole.OWNER,
    endpoint: "PATCH/bucket-roles",
  },
  REVOKE_MAINTAINER_ROLE: {
    bucketRole: BucketRole.OWNER,
  },
  CHANGE_BUCKET_OWNERSHIP: {
    bucketRole: BucketRole.OWNER,
  },
};

import { BucketRole, FileRole } from "./Roles";

//This enum defines the relationship between an action and the minimum access
// role required to do it.
export const Action = {  
    //View list of files in a bucket
    VIEW_FILES_IN_BUCKET: [BucketRole.VIEWER],
    VIEW_FILE: [BucketRole.VIEWER, FileRole.FILE_VIEWER],
    CREATE_FILE: [BucketRole.RESTRICTED_EDITOR, FileRole.FILE_EDITOR],
    UPDATE_FILE: [BucketRole.EDITOR, FileRole.FILE_EDITOR],
    SOFT_DELETE_FILE: [BucketRole.MAINTAINER, FileRole.FILE_OWNER],
    CHANGE_FILE_VERSION: [BucketRole.MAINTAINER, FileRole.FILE_EDITOR],
    //Permanently delete file
    DELETE_FILE: [BucketRole.OWNER, FileRole.FILE_OWNER],
    //Assign bucket role below MAINTAINER or file role below FILE_OWNER to user
    ASSIGN_BUCKET_ROLE: [BucketRole.MAINTAINER],
    //Revoke bucket role below MAINTAINER or file role below FILE_OWNER from user
    REVOKE_BUCKET_ROLE: [BucketRole.MAINTAINER],
    ASSIGN_MAINTAINER_ROLE: [BucketRole.OWNER],
    REVOKE_MAINTAINER_ROLE: [BucketRole.OWNER],
    CHANGE_BUCKET_OWNERSHIP: [BucketRole.OWNER]
 }
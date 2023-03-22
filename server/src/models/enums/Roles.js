//Roles for actions within a bucket
export const BucketRole = {
    //viewer can read/download from a bucket
    VIEWER: {
        type: "BucketRole",
        string: "VIEWER",
        value: 1
    },
    //restricted editor can create new files in bucket
    RESTRICTED_EDITOR: {
        type: "BucketRole",
        string: "RESTRICTED_EDITOR",
        value: 2
    },
    //editor can update files with versioning
    EDITOR: {
        type: "BucketRole",
        string: "EDITOR",
        value: 3
    },
    //maintainer can add new users to a bucket,
    //assign bucket and file roles to users (but only owners can change roles of a maintainer or above),
    //change file versions,
    //soft delete files
    MAINTAINER: {
        type: "BucketRole",
        string: "MAINTAINER",
        value: 4
    },
    //owner can delete the bucket,
    //transfer ownership to another user,
    //permanently delete files
    OWNER: {
        type: "BucketRole",
        string: "OWNER",
        value: 5
    }
 }

 //Roles for actions on a single file
 export const FileRole = {
    //File viewer can only read the file
    FILE_VIEWER: {
        type: "FileRole",
        string: "FILE_VIEWER",
        value: 1
    },
    //File editor can update the file with versioning
    FILE_EDITOR: {
        type: "FileRole",
        string: "FILE_EDITOR",
        value: 2
    },
    //File owner can soft delete or permanently delete the file
    FILE_OWNER: {
        type: "FileRole",
        string: "FILE_OWNER",
        value: 3
    }
 }
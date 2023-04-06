# node-gcpbucket-uploader

A basic node server for uploading files to a [google cloud storage bucket](https://cloud.google.com/storage/docs/creating-buckets). It uses [Express](https://expressjs.com/) to create the server and the [Multer npm package](https://www.npmjs.com/package/multer) for accepting files through http requests.

## GCP Setup

`cd` into the [server](/server) and run `npm i` in each directory to install the npm packages.

Add a `.env` file in the [server](/server) and add the following keys:

```sh

BUCKET_ID=Your gcp bucket id

```

You also need to create a [GCP service account](https://cloud.google.com/iam/docs/service-accounts) with appropriate access to your Cloud Storage Bucket. You can create a service account by logging into the GCP console, click on the navigation menu, select IAM & Admin, service accounts, create service account. Apply the appropriate roles to your service account. If you have any troubles creating project resources, in the top right of the GCP console is a help assistant button. Click it, ask for help, and do what it tells you.   

Download the JSON key, and put this under [configs](/server/src/configs) directory as `key.json`.

Run `npm run dev` to start up the server. The server runs locally on [http:localhost:5000](http:localhost:5000).

## Database Setup

Create a MySQL instance in CloudSQL. To do this in the GCP console click the navigation menu, SQL, then hit create instance. Open up the console in Google cloud to connect to the instance. Then run the `tables.sql` script inside of the models folder to create the tables.

To connect to your CloudSQL database while running the app locally you must have a .env file with the `DB_HOST`, `DB_DATABASE`, `DB_USER`, and `DB_PASS` values.

```sh

DB_HOST= Public IP address of instance

DB_DATABASE= DB name here

DB_USER= username

DB_PASS= password

```
The public IP address of your instance may be found by looking at your instance in the SQl tab of the GCP console. 
Also you will need to whitelist your computer's public ip address so that GCP will let you connect. You can do this by going to your instance in the Google Cloud console and clicking on Connections -> Authorized Networks -> Add Network then put in your ip address.

Run `npm run dev` to start up the server. You can now make http POST requests to [http:localhost:5000/api/users](http:localhost:5000/api/users) with a request body that includes `{password: -, first_name: -, last_name: -}` to add a row to the `user` table. The response will return the generated user id that you can then use to query for the user's information by sending a GET to [http:localhost:5000/api/users/{user_id}](http:localhost:5000/api/users/user_id)

## Authentication

Most endpoints require authentication before they are authorized for use. This project uses [JSON web tokens](https://jwt.io/) to acheive this. Add a `JWT_SECRET` to the server .env file:

```sh

JWT_SECRET= your_jwt_secret

```

The following endpoints are associated with users and authentication:

| Method | Endpoint  | Required Content                                               |
| ------ | --------- | -------------------------------------------------------------- |
| POST   | /api/users | in body: `{"email": "your_email", "first_name": "your_name", "last_name":"your_last_name", "password":"your_password", "phone_number":"your_phone_number"}` |
| POST   | /api/auth | in body: `{"email": "your_email", "password":"your_password"}` |
| GET    | /api/auth | in headers: `{"x-auth-token:"your_json_web_token"}`            |

NOTE: Each "private" endpoint must include a valid JSON web token in the headers as `{"x-auth-token:"your_json-web-token"}`. The [auth middleware](/server/src/middlewares/auth.js) is used for each private request to decode the token and get the associated user data.

## Adding Files to the Default Bucket and Creating New Buckets

Here are the current supported requests related to file uploads and bucket creation:

NOTE: All of these endpoints must include a valid JSON web token in the headers as `{"x-auth-token:"your_json-web-token"}`- required for [auth middleware](/server/src/middlewares/auth.js). These requests will also require routing through [role auth middleware](/server/src/middlewares/roleAuth.js) or [file role auth middleware](/server/src/middlewares/fileRoleAuth.js). Role authorization is required when a target user is involved (like when updating a user's bucket role or assigning a user to a bucket) and file role authorization is required working with any files in a bucket (like when uploading or downloading)

| Method | Endpoint     | Body Content |Action |
| ------ | ------------ | -------------|-------|
| POST   | /api/buckets | `{"bucket_name:"your_bucket_name"}`|Create a bucket|
| POST   | /api/buckets/bucket-roles | `{"bucket_name:"your_bucket_name", "targetUserId":"id_of_target_user", "targetRole":"role_to_make_target_user" }`|Add a user to a bucket|
| PATCH  | /api/buckets/bucket-roles | `{"bucket_name:"your_bucket_name", "targetUserId":"id_of_target_user", "targetRole":"role_to_make_target_user" }`|Update a user's bucket role|
| POST  | /api/uploads/upload-file | `{"uploaded_file": "your_file_to_upload"` as [form-data](https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data),`"bucket_name": "your_bucket_name"}`|Upload a file to a bucket|
| GET   | /api/downloads/download-file | `{"bucket_name:"your_bucket_name", "destPath": "full_file_destination_path_with_trailing_\", "file_id": "id_of_file_to_be_downloaded"}`|Download file|

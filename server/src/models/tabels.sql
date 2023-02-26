CREATE DATABASE IF NOT EXISTS file_share;

USE file_share;

DROP TABLE IF EXISTS user;
CREATE TABLE user (
	user_id varchar(45) NOT NULL,
    password varchar(60) NOT NULL,
    first_name varchar(45) NOT NULL,
    last_name varchar(45) NOT NULL,
    email varchar(45),
    phone_number varchar(45),
	PRIMARY KEY(user_id)
);

DROP TABLE IF EXISTS bucket_user;
CREATE TABLE bucket_user (
	bucket_id varchar(45) NOT NULL,
	user_id varchar(45) NOT NULL,
    bucket_role varchar(45),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
	PRIMARY KEY(bucket_id, user_id)
);

DROP TABLE IF EXISTS file_user;
CREATE TABLE file_user (
	file_name varchar(45) NOT NULL, 
    bucket_id varchar(45) NOT NULL,
    user_id varchar(45) NOT NULL,
    file_role varchar(45),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bucket_id) REFERENCES bucket_user(bucket_id) ON DELETE CASCADE,
	PRIMARY KEY(file_name, bucket_id, user_id)
);

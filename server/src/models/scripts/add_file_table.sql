CREATE TABLE file (
	file_id varchar(45) NOT NULL,
	bucket_id varchar(45) NOT NULL,
	file_name varchar(45) NOT NULL, 
    version varchar(60),
    isActive boolean,
    FOREIGN KEY (bucket_id) REFERENCES bucket_user(bucket_id) ON DELETE CASCADE,
	PRIMARY KEY(file_id, bucket_id, version)
);
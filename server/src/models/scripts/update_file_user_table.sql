ALTER TABLE file_user DROP PRIMARY KEY; 
/*
If dropping this foregin key fails because it can't find the correct name of the fk,
then run:
show create table file_user;
To find the name of the fk constraint and replace it in the drop foreign key statement
*/
ALTER TABLE file_user DROP FOREIGN KEY file_user_ibfk_2;
ALTER TABLE file_user ADD column file_id varchar(45) NOT NULL;
ALTER TABLE file_user ADD CONSTRAINT fk_file_id FOREIGN KEY (file_id) REFERENCES file(file_id);
ALTER TABLE file_user ADD CONSTRAINT pk_file_user PRIMARY KEY (user_id, file_id); 
ALTER TABLE file_user DROP column file_name;
ALTER TABLE file_user DROP column bucket_id;
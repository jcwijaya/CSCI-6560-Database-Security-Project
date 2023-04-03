#For more information on multi factor authentication (MFA) in mySQL refer to 
#https://dev.mysql.com/doc/refman/8.0/en/multifactor-authentication.html#multifactor-authentication-elements


#FOr more information on using roles refer to
#https://dev.mysql.com/doc/refman/8.0/en/roles.html

#For more information on plugins available for MFA and how to download:

#Installing PLugins
#https://dev.mysql.com/doc/refman/8.0/en/plugin-loading.html

#Tyes of available Authentication plugins 
#https://dev.mysql.com/doc/refman/8.0/en/authentication-plugins.html




#Load pam plugin for 2 factor auth
INSTALL PLUGIN authentication_pam SONAME 'authentication_pam.so';




#Set requirement for 2 factor authentication
SET GLOBAL authentication_policy='caching_sha2_password,*,'; #1 * is defualt 2 *'s means  2 factor

#Create role, assign all privelages to the role
create role if not exists 'Developer';
grant all on *.* to 'Developer';
show grants for 'Developer';
#Developer is now a role with ALL privelages

#Create an account that has the developer role
create user 'OriginalDevRole'@'localhost' identified by 'OGDevPass';
#Grant Dev role to account
grant 'Developer' to 'OriginalDevRole'@'localhost';

#Lock the account 
ALTER USER 'OriginalDevRole'@'localhost' ACCOUNT LOCK;

#This section shows an example way to create users with the same
#privelages as the developer account.
#Each user is also given an extra authentication method through
#the mySQL windows authentication plugin. Certain plugins
#are only available on the enterprise version of mySQL
#and only apply to certain OS or require additional 
#infrastructure to function. 

#Create sample users and give them the same privelages as the OG account
#In the future, as these employeees quit their accounts can be locked
#but the prielages will remain and can be associated with new employees


#2 factor with windows authentication
#Windows users named Jessica are permitted to authenticate to the server as a MySQL user.
#As are any Windows users in the Administrators or Power Users group. 
CREATE USER if not exists 'JessicaW'@'localhost' IDENTIFIED with caching_sha2_password BY 'JessicaPass'
and IDENTIFIED WITH authentication_windows
AS 'Jessica, Administrators, "Power Users"';
GRANT 'OriginalDevRole'@'localhost' TO 'JessicaW'@'localhost';

  
#Kyle has the same permissions as Jessica, and same windows authentication, but has a different password
CREATE USER if not exists 'KyleD'@'localhost' IDENTIFIED with caching_sha2_password BY 'KylePass'
and IDENTIFIED ITH authentication_windows
AS 'Kyle, Administrators, "Power Users"';
GRANT 'OriginalDevRole'@'localhost' TO 'KyleD'@'localhost';

#Joseph has the same permissions as Kyle and Jessica with the same windows authentication, but has a different 
#password
CREATE USER if not exists 'JosephM'@'localhost' IDENTIFIED with caching_sha2_password BY 'JosephPass'
and IDENTIFIED WITH authentication_windows
AS 'Joseph, Administrators, "Power Users"';
GRANT 'OriginalDevRole'@'localhost' TO 'JosephM'@'localhost';



#Revoke privelages for the role
#This is unlikely to be used, unless the role is being phased out of usage, or the role permissions
#are being split into different roles
revoke all on *.* from 'Developer';

#Revoke developer role Access from a particular User
revoke 'Developer' from #Insert user here#;

#Delete the role 
drop role if exists 'Developer';



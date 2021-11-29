# ms-nodejs-server
Backend micro service for basic cruds employees/companies

operations
Methods	Urls	    Actions

GET  /employee/list         : fetch all employees existing in DB
POST /employee/create       : create an employee in DB
POST /employee/update/employeeId : update an employee in DB with specific ID
DELETE /employee/delete/employeeId : update an employee in DB with specific ID

GET  /company/list         : fetch all companies existing in DB
POST /company/create       : create a company in DB
POST /company/update/employeeId : update a company in DB with specific ID
DELETE /company/delete/employeeId : update a company in DB with specific ID

/api/signup : to register and get generate jwt to client
/api/signin : to authenticate (as admin/user)
/api/signout : to signout

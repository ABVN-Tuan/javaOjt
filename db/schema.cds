namespace ojt;
using { managed } from '@sap/cds/common';
//Roles
entity Roles : managed{
    key ID: UUID;
    name: String(50);
    baseSalary: Double;
    allowance: Double
}
//Departments
entity Departments{
    key ID : UUID;
    name : String(50);
}
//Employees
entity Employees : managed {
  key ID     : UUID;
  firstName  : String(50);
  lastName   : String(50);
  email      : String;
  hireDate   : Date;
  dateOfBirth: Date;
  salary     : Double;
  gender     : String;
  role: Association to Roles;
  department : Association to Departments;
  performanceRating : Integer @assert.range: [1, 5];
    
}

//leaveRequest
entity leaveRequest : managed {
    key ID: UUID;
    employee: Association to Employees;
    startDate: Date;
    endDate: Date;
    status: String(20);
    reason: String(50);
}
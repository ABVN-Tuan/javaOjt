using {ojt as data} from '../db/schema';

@path: '/ojt'
service myService {
    entity Roles        as projection on data.Roles;
    entity Departments  as projection on data.Departments;
    entity Employees    as projection on data.Employees;
    entity leaveRequest as projection on data.leaveRequest;

    type EmployeeInput : {
        ID                : UUID;
        hireDate          : Date;
        role_ID           : UUID;
        performanceRating : Integer;
    }

    function whoami()                               returns String;
    action   calEmpSalary(Employee : EmployeeInput) returns Double;
}

// Grand authorization for entity Employees by role
// annotate myService.Employees with @(restrict: [
//     {
//         grant: ['READ'],
//         to   : ['employee']
//     },
//     {
//         grant: [
//             'READ',
//             'UPDATE',
//             'CREATE',
//             'DELETE'
//         ],
//         to   : ['admin']
//     },
// ]);

// // Grand authorization for entity Roles by role
// annotate myService.Roles with @(restrict: [
//     {
//         grant: ['READ'],
//         to   : ['employee']
//     },
//     {
//         grant: [
//             'READ',
//             'UPDATE',
//             'CREATE',
//             'DELETE'
//         ],
//         to   : ['admin']
//     }]);
// // Grand authorization for entity Departments by role
// annotate myService.Departments with @(restrict: [
//     {
//         grant: ['READ'],
//         to   : ['employee']
//     },
//     {
//         grant: [
//             'READ',
//             'UPDATE',
//             'CREATE',
//             'DELETE'
//         ],
//         to   : ['admin']
//     }
// ]);

// // Grand authorization for entity leaveRequest by role
// annotate myService.leaveRequest with @(restrict: [{
//     grant: [
//         'READ',
//         'UPDATE',
//         'CREATE',
//         'DELETE'
//     ],
//     to   : ['admin']
// }]);

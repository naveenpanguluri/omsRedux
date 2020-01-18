export const INITIAL_STATE = {
    credentials: {
        // "Data": [
        //     {
        //         "ID": 1,
        //         "UserName": "tms1",
        //         "Password": null,
        //         "ConfirmPassword": null,
        //         "FirstName": "tms user",
        //         "LastName": "one",
        //         "Applications": null,
        //         "IsActive": true,
        //         "ApplicationNames": null,
        //         "Roles": null,
        //         "Regions": null
        //     }
        // ],
        // "Status": "Success",
        // "StatusCode": 200,
        // "StatusMessage": "User Logged In Successfully",
        // "TokenKey": "/LN4/q3IvTn8oTMfqKQYDHMAESsh5mSpyu/elNUfIubEq9g9u0mT47++rllXRcMq",
        // "TokenIssuedOn": "2019-05-07T21:16:03.367",
        // "TokenExpiresOn": "2019-08-09T02:31:20.527",
        // "NumberOfRecords": 0
    },
    error: {
        show: false,
        heading: "Something went wrong!",
        text: "Please try again later. We apologize for the inconvinience caused."
    },
    warning: {
        show: false,
        text: "Are you sure?",
        onClick: console.log("Warning initial click")
    },
    layout: {
        sidebar: {
            desktop: false,
            mobile: false
        }
    },
    loader: [],
    views: {
        authorization: {
            userRoleTable: {
                PageNumber: 1,
                NumberOfRecords: 0,
                PageSize: 10,
                SortOrder: "username",
                Data: []
            },
            userRoleData: {
                users: [],
                roles: [],
                regions: []
            },
            rolesMngtTable: {
                PageNumber: 1,
                NumberOfRecords: 0,
                PageSize: 10,
                SortOrder: "rolecode",
                Data: []
            },
            menuActivities: [],
            userAppTable: {
                PageNumber: 1,
                NumberOfRecords: 0,
                PageSize: 10,
                SortOrder: "username",
                Data: []
            },
            applications: []
        },
        orders: {
            downloadOrdersTable: {
                PageNumber: 1,
                NumberOfRecords: 0,
                PageSize: 10,
                SortOrder: "OrderNumber",
                Data: [],
                APIRequested: false
            },
            orderStatus: []
        }
    }
};
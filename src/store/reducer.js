import { combineReducers } from 'redux';
import * as ActionType from './types';
import * as AuthorizationReducer from './viewsreducers/authourization';
import * as OrdersReducer from './viewsreducers/orders';
import { INITIAL_STATE } from './initailstate';

/* CREDENTIALS */

const credentialsReducer = (state = INITIAL_STATE.credentials, action) => {
    switch (action.type) {
        case ActionType.Modify_Credentials:
            return Object.assign({}, action.payload);
        default:
            return state
    }
}

/* ERROR */

const errorReducer = (state = INITIAL_STATE.error, action) => {
    switch (action.type) {
        case ActionType.Modify_Error:
            return Object.assign({}, INITIAL_STATE.error, action.payload);
        default:
            return state
    }
}

/* WARNING */

const warningReducer = (state = INITIAL_STATE.warning, action) => {
    switch (action.type) {
        case ActionType.Modify_Warning:
            return Object.assign({}, INITIAL_STATE.warning, action.payload);
        default:
            return state
    }
}

/* LAYOUT */

const layoutReducer = (state = INITIAL_STATE.layout, action) => {
    let { sidebar } = state;
    switch (action.type) {
        case ActionType.Switch_Desk_Sidebar:
            return Object.assign({}, state, { sidebar: Object.assign({}, sidebar, { desktop: !sidebar.desktop }) });
        case ActionType.Switch_Mob_Sidebar:
            return Object.assign({}, state, { sidebar: Object.assign({}, sidebar, { mobile: !sidebar.mobile }) });
        default:
            return state
    }
};

/* LOADER */

const loaderReducer = (state = INITIAL_STATE.loader, action) => {
    switch (action.type) {
        case ActionType.Add_Loader:
            return [...state, action.payload]
        case ActionType.Remove_Loader:
            return state.filter(x => (x !== action.payload))
        default:
            return state
    }
}

/* VIEWS */

const viewsReducer = (state = INITIAL_STATE.views, action) => {
    return ({
        authorization: {
            userRoleTable: AuthorizationReducer.userRoleTable(state.authorization.userRoleTable, action),
            userRoleData: AuthorizationReducer.userRoleData(state.authorization.userRoleData, action),
            rolesMngtTable: AuthorizationReducer.rolesMngtTable(state.authorization.rolesMngtTable, action),
            menuActivities: AuthorizationReducer.menuActivities(state.authorization.menuActivities, action),
            userAppTable: AuthorizationReducer.userAppTable(state.authorization.userAppTable, action),
            applications: AuthorizationReducer.applications(state.authorization.applications, action)
        },
        orders:{
            downloadOrdersTable: OrdersReducer.downloadOrdersTable(state.orders.downloadOrdersTable, action),
            orderStatus: OrdersReducer.getOrderStatus(state.orders.orderStatus, action)
        }
    })
}

export default combineReducers({
    credentials: credentialsReducer,
    error: errorReducer,
    warning: warningReducer,
    layout: layoutReducer,
    loader: loaderReducer,
    views: viewsReducer
});
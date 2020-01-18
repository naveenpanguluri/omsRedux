import * as ActionType from '../types';
import { INITIAL_STATE } from '../initailstate';

const {views} = INITIAL_STATE, { orders } = views;

/* ORDERS TABLE */

export const downloadOrdersTable = (state = orders.downloadOrdersTable, action) => {
    switch (action.type) {
        case ActionType.Modify_Download_Orders_Table:
            console.log("action.payload", action.payload)
            return Object.assign({}, state, action.payload, { APIRequested: true });
        default:
            return state
    }
}

export const getOrderStatus = (state = orders.orderStatus, action) => {
    switch (action.type) {
        case ActionType.Modify_Order_Status:
            return action.payload;
        default:
            return state
    }
}
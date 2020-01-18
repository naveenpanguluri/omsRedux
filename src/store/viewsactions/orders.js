import * as ActionType from '../types';
import axios from 'axios';

import { rootURL, ops } from '../../config';

import { addloader, removeloader, modifyerror } from '../actions';

/* DOWNLOAD ORDERS */

// Actions

export const modifydownloadorderstable = val => (
    {
        type: ActionType.Modify_Download_Orders_Table,
        payload: val
    }
);

export const modifyorderstatus = val => (
    {
        type: ActionType.Modify_Order_Status,
        payload: val
    }
);

// Thunk
export const getdownloadorders = body => {
    return async function (dispatch, getState) {
        dispatch(addloader('getdownloadorders'));

        await axios(rootURL + ops.orders.getorders, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Token": getState().credentials.TokenKey
            },
            data: JSON.stringify(body)
        })
            .then(function (response) {
                console.log(response)
                if (response.statusText === "OK" && (response.data.Status === "Success" || (response.data.Status === "Failure" && response.data.NumberOfRecords === 0))) {
                    let { NumberOfRecords, Data } = response.data,
                        { PageNumber, PageSize, SortOrder } = body;
                    dispatch(modifydownloadorderstable({ NumberOfRecords, Data, PageNumber, PageSize, SortOrder }));
                }
                else {
                    console.log("response", response);
                    dispatch(modifyerror({ show: true }));
                }
            })
            .catch(function (error) {
                dispatch(modifyerror({ show: true }));
                console.log("error", error)
            });

        dispatch(removeloader('getdownloadorders'));
    };
}

export const getorderstatus = (failure) => {
    return async function (dispatch, getState) {
        dispatch(addloader('getorderstatus'));

        await axios(rootURL + ops.orders.getallorderstatus, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Token": getState().credentials.TokenKey
            }
        })
            .then(function (response) {
                console.log(response);
                if (response.statusText === "OK" && response.data.Status === "Success") {
                    if (!response.data.Data && response.data.Data.length === 0) {
                        failure();
                        dispatch(modifyerror({
                            show: true,
                            heading: "Data missing!",
                            text: "Data is missing for 'Status Reservasi' options. Please create the related entries first to proceed."
                        }));
                    }
                    else {
                        dispatch(modifyorderstatus(response.data.Data));
                    }
                }
                else {
                    console.log("response", response);
                    dispatch(modifyerror({ show: true }));
                }
            })
            .catch(function (error) {
                dispatch(modifyerror({ show: true }));
                console.log("error", error)
            });

        dispatch(removeloader('getorderstatus'));
    };
}
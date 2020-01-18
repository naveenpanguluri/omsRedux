import React from 'react';
import './downloadorder.scss';
// import classNames from 'classnames/bind';
import axios from 'axios';
// import { toast } from 'react-toastify';
import { rootURL, ops } from '../../config';

import Form from '../common/form';
import ToggleBound from '../common/togglebound';
import Pagination from '../common/pagination';
import PageSizeSelector from '../common/pagesizeselector';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror } from '../../store/actions';
import { getdownloadorders, getorderstatus } from '../../store/viewsactions/orders';

const XLSX = require('xlsx');


let uploadFormElems = [
    {
        name: 'Tanggal Order',
        placeholder: 'From Date',
        value: new Date(),
        errMsg: '',
        required: false,
        valid: true,
        field: {
            type: "datepicker"
        },
        gridClass: "col-12 col-sm-6 col-md-4 col-lg-3 fromDate"
    },
    {
        name: 'Tanggal Order 2',
        placeholder: 'To Date',
        value: null,
        errMsg: '',
        required: false,
        valid: true,
        field: {
            type: "datepicker"
        },
        gridClass: "col-12 col-sm-6 col-md-4 col-lg-3 hide-label"
    },
    {
        name: 'Status Reservasi',
        value: '',
        errMsg: '',
        required: false,
        valid: true,
        field: {
            type: "select",
            options: [
                {
                    label: 'Status Reservasi',
                    value: ''
                }
            ]
        },
        gridClass: "col-12 col-sm-6 col-md-4 col-lg-6",
        check: [
            {
                regex: "^[0-9]+$",
                message: "Please select an option"
            }
        ]
    },
    {
        name: 'No. Order',
        placeholder: 'Masukkan nomor order',
        value: '',
        errMsg: '',
        required: false,
        valid: true,
        field: {
            type: "text"
        },
        gridClass: "col-12 col-md-6 col-lg-6",
        check: [
            {
                regex: "^.{3,}$",
                message: "Should atleast be 3 characters"
            },
            {
                regex: "^[a-zA-Z0-9]{3,}$",
                message: "First name should not have any special characters, numerics or spaces"
            }
        ]
    }
],
    jsonColumns = ["BusinessArea", "OrderNo", "SequenceNo", "PartnerNo1", "PartnerType1", "PartnerName1", "PartnerNo2", "PartnerType2", "PartnerName2", "PartnerNo3", "PartnerType3", "PartnerName3", "FleetType", "OrderType", "VehicleShipmentType", "DriverNo", "DriverName", "VehicleNo", "OrderWeight", "OrderWeightUM", "EstimationShipmentDate", "EstimationShipmentTime", "ActualShipmentDate", "ActualShipmentTime", "Sender", "Receiver", "OrderShipmentStatus", "Dimension", "TotalPallet", "Instructions", "ShippingListNo", "PackingSheetNo", "TotalCollie", "ShipmentSAPNo"],
    excelColumns = ["BusinessArea", "Order No", "SequenceNo", "PartnerNo1", "PartnerType1", "Partnet Name 1", "PartnerNo 2", "Partner Type 2", "Partner Name 2", "Partner No 3", "Partner Type 3", "Partner Name 3", "Fleet Type", "Order Type", "Vehicle Shipment", "Driver No", "Driver Name", "Vehicle No", "Order Weight", "Order Weight Unit Of Measure", "Estimation Shipment Date", "Estimation Shipment Time", "Actual Shipment Date", "Actual Shipment Time", "Sender", "Receiver ", "Order Shipment Status", "Dimension", "Total Pallet", "Instructions", "Shipping List No", "Packing Sheet No", "Total Collie", "Shipment SAP No"];

class DownloadOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inbound: true,
            PageSize: 10,
            PageNumber: 1,
            ordersFilter: {},
            uploadFormElems: [],
            orderStatusAdded: false,
            dataNull: false
        }

        props.getorderstatus(this.failure);
    }

    failure = async () => {
        if (!this.state.dataNull) {
            await this.setState({ dataNull: true });
            this.props.history.push('/dashboard');
        }
    }

    componentDidMount() {
        this.componentInitCheck();
    }

    componentDidUpdate() {
        this.componentInitCheck()
    }

    async componentInitCheck() {
        if (this.props.orderStatus.length && !this.state.orderStatusAdded) {
            this.refs.formRef.modifyFormObj(this.uploadFormElems());
            await this.setState({ orderStatusAdded: true });
            this.refs.formRef.onFormSubmit();
        }
    }

    uploadFormElems() {
        let formObj = JSON.parse(JSON.stringify(uploadFormElems));

        formObj[2].field.options = [formObj[2].field.options[0], ...this.props.orderStatus.map(x => { return { label: x.Value, value: x.Id } })];

        return formObj;
    }

    modalFormSubmit(data) {
        let postObj = {};

        function getVal(i) {
            return data[i].value
        }

        if (getVal(0)) {
            let d = new Date(getVal(0));
            postObj.FromDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
        }

        if (getVal[1]) {
            let d = new Date(getVal(1));
            postObj.ToDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
        }

        if (getVal(2)) {
            postObj.StatusID = getVal(2)
        }

        if (getVal(3)) {
            postObj.OrderNumber = getVal(3)
        }

        this.setState({ ordersFilter: postObj });

        this.getOrdersList(postObj);
    }

    async paginate(i) {
        await this.setState({ PageNumber: i });
        this.getOrdersList({});
    }

    async rowsPerPageChange(i) {
        await this.setState({ PageSize: i, PageNumber: 1 });
        this.getOrdersList({});
    }

    getOrdersList(obj) {
        this.props.getdownloadorders({
            "Requests": [obj],
            "SortOrder": "OrderNumber",
            "PageSize": this.state.PageSize,
            "PageNumber": this.state.PageNumber
        });
    }

    async downloadExcel() {
        let self = this;
        this.props.addloader('userAppFormSubmit');

        let body = {
            "Requests": [this.state.ordersFilter],
            "SortOrder": "OrderNumber"
        };

        await axios(rootURL + ops.orders.getorders, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            },
            data: JSON.stringify(body)
        })
            .then(function (response) {
                if (response.statusText === "OK") {
                    if (response.statusText === "OK" && response.data.Status === "Success") {
                        let excelData = [];

                        for (let x of response.data.Data) {
                            let obj = { "ID": 0 };
                            for (let i in excelColumns) {
                                obj[excelColumns[i]] = x[jsonColumns[i]]
                            }
                            excelData.push(obj);
                        }

                        let ws = XLSX.utils.json_to_sheet(excelData, { header: excelColumns }),
                            wb = XLSX.utils.book_new();

                        XLSX.utils.book_append_sheet(wb, ws, "Orders");

                        /* generate an XLSX file */
                        XLSX.writeFile(wb, "Orders.xlsx");
                    }
                    else {
                        console.log("response", response);
                        self.props.modifyerror({ show: true });
                    }
                }
                else {
                    console.log("response", response);
                    self.props.modifyerror({ show: true });
                }
            })
            .catch(function (error) {
                self.props.modifyerror({ show: true });
                console.log("error", error)
            });

        this.setState({ showModal: false });
        this.props.removeloader('userAppFormSubmit');
    }

    render() {
        return (
            <React.Fragment>
                <div className="text-right">
                    <ToggleBound toggle={this.state.inbound} onClick={() => this.setState({ inbound: !this.state.inbound })} />
                </div>
                <div className="tabs-wrap">
                    <div className="tabs-header-wrap">
                        <div className="tabs-title d-none d-md-block d-lg-block active">Download Order</div>
                        <div className="clearfix"></div>
                    </div>
                    <div className="tabs-content">
                        <Form
                            fields={this.state.uploadFormElems}
                            className="upload-form px-2"
                            footerClassName="col-12"
                            formButtons={<button className="text-uppercase btn btn-primary search-button px-5 mt-0" type="submit">Search</button>}
                            onSubmit={obj => this.modalFormSubmit(obj)}
                            ref="formRef"
                        />

                        {
                            Boolean(this.props.downloadOrdersTable.APIRequested) &&

                            <React.Fragment>
                                <hr className="row mt-5" />

                                <div className="search-results-wrap">

                                    <div className="d-block d-md-flex d-lg-flex align-items-center">
                                        <h6 className="px-2 font-weight-bold m-0 flex-grow-1">Preview</h6>
                                        {
                                            Boolean(this.props.downloadOrdersTable.NumberOfRecords) &&
                                            <div className="flex-grow-0">
                                                <button type="button" onClick={() => this.downloadExcel()} className="align-items-center btn btn-success d-flex download-result-button">
                                                    <span className="button-title">Download Excel</span>
                                                    <i className="far fa-arrow-alt-circle-down pl-2"></i>
                                                </button>
                                            </div>
                                        }
                                    </div>

                                    <PageSizeSelector NumberOfRecords={this.props.downloadOrdersTable.NumberOfRecords} value={this.state.PageSize} onChange={x => this.rowsPerPageChange(x)} />

                                    <div className="table-responsive table-cover px-2 mt-4">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Sequence No.</th>
                                                    <th scope="col">Source</th>
                                                    <th scope="col">Destination</th>
                                                    <th scope="col">Shipment Date</th>
                                                    <th scope="col">Vehicle Type</th>
                                                    <th scope="col">Fleet Type</th>
                                                    <th scope="col">Driver No.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Boolean(this.props.downloadOrdersTable.NumberOfRecords) ?
                                                        this.props.downloadOrdersTable.Data.map((x, i) =>
                                                            <tr key={i}>
                                                                <td>{x.SequenceNo}</td>
                                                                <td>{x.Sender}</td>
                                                                <td>{x.Receiver}</td>
                                                                <td>{x.ActualShipmentDate}</td>
                                                                <td>{x.VehicleShipmentType}</td>
                                                                <td>{x.FleetType}</td>
                                                                <td>{x.DriverNo}</td>
                                                            </tr>
                                                        ) :
                                                        <tr><td className="text-center" colSpan="7">No records found</td></tr>
                                                }
                                            </tbody>
                                        </table>
                                        <Pagination PageSize={this.state.PageSize} PageNumber={this.state.PageNumber} NumberOfRecords={this.props.downloadOrdersTable.NumberOfRecords} onClick={i => this.paginate(i)} />
                                    </div>
                                    {/*
                                        <div className="py-4 row px-2">
                                            <div className="col-6">
                                                <button type="button" className="btn btn-primary search-result-button w-100 d-flex">
                                                    <span className="button-title">TMS-28032019-inbound.xls</span>
                                                    <i className="far fa-arrow-alt-circle-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                    */}
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    let { credentials, views } = state,
        { orders } = views,
        { downloadOrdersTable, orderStatus } = orders;
    return { credentials, downloadOrdersTable, orderStatus }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror,
        getdownloadorders,
        getorderstatus
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DownloadOrder);
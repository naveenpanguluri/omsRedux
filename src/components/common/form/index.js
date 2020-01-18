import React from 'react';
import './form.scss';
import classNames from 'classnames/bind';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = { form: this.props.fields, formSubmitted: false };
    }

    onFormChange(val, ...field) {
        let { form } = this.state,
            newFormObj = form.map(x => {
                if (x.name === field[0].name) {
                    if (x.field.type === "checkbox") {
                        x.field.options.map(y => {
                            if (y.label === field[1].label) {
                                y.checked = val;
                            }
                            return y
                        })
                        x.valid = Boolean(x.field.options.filter(y => y.checked).length)
                    }
                    else if (x.field.type === "radio") {
                        x.value = val;
                        x.valid = Boolean(x.value);
                    }
                    else if (x.field.type === "datepicker") {
                        x.value = new Date(val).getTime();
                        x.valid = x.required ? Boolean(val) : true;
                        x.errMsg = "";
                    }
                    else if (x.field.type === "confirm") {
                        x.value = val;
                        x.valid = (val === form.find(d => (d.name === x.field.pair)).value);
                        x.errMsg = x.valid ? "" : `${x.field.pair} does not match`
                    }
                    else {
                        x.value = val;
                        x.errMsg = "";
                        x.valid = true;

                        if (val === "" && x.required) {
                            x.valid = false;
                        }

                        if (!(val === "" && !x.required)) {
                            for (let y of x.check) {
                                if (!new RegExp(y.regex).test(val)) {
                                    x.errMsg = y.message;
                                    x.valid = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                return x;
            });
        newFormObj = newFormObj.map(x => {
            if (x.field.type === "confirm") {
                x.valid = (x.value === form.find(d => (d.name === x.field.pair)).value);
                x.errMsg = x.valid ? "" : `${x.field.pair} does not match`
            }
            return x
        });
        this.setState({ form: newFormObj });
    }

    onFormSubmit(e) {
        if (e)
            e.preventDefault();
        let { form } = this.state,
            invalidFields = form.filter(x => (!x.valid));
        if (invalidFields.length) {
            let newFormObj = form.map(x => {
                if (x.value === "" && x.required) {
                    x.errMsg = "Required Field"
                }
                return x
            })
            this.setState({ form: newFormObj, formSubmitted: true });
        }
        else {
            this.props.onSubmit(this.state.form)
        }
    }

    switchFormSubmit(toState) {
        this.setState({ formSubmitted: toState });
    }

    modifyFormObj(obj) {
        this.setState({ form: obj });
    }

    getFormState() {
        return this.state;
    }

    generateField(x) {
        let fieldCode = null;

        switch (x.field.type) {

            case "text":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="text" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                break;

            case "password":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="password" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                break;

            case "confirm":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="password" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                break;

            case "datepicker":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <DatePicker dateFormat="dd.MM.yyyy" selected={Boolean(x.value) ? new Date(x.value) : ""} onChange={e => this.onFormChange(e, x)} className="form-control" />
                        <small className="form-text text-danger">{this.state.formSubmitted && x.errMsg}</small>
                    </div>
                break;

            case "select":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <select className="form-control" disabled={Boolean(x.disabled)} value={x.value} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null}>
                            {
                                x.field.options.map(y =>
                                    <option key={y.value} value={y.value}>{y.label}</option>
                                )
                            }
                        </select>
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                break;

            case "checkbox":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate d-block">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        {
                            x.field.options.map(y =>
                                <div key={y.label} className={classNames("form-check", { "form-check-inline": x.field.horizontal })}>
                                    <input className="form-check-input" disabled={Boolean(x.disabled)} type="checkbox" checked={y.checked} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.checked, x, y) : null} />
                                    <label className="form-check-label">{y.label}</label>
                                </div>
                            )
                        }
                        <small className="form-text text-danger">{(this.state.formSubmitted && !x.valid) && x.errMsg}</small>
                    </div>
                break;

            case "radio":
                fieldCode =
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate d-block">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        {
                            x.field.options.map(y =>
                                <div key={y} className={classNames("form-check", { "form-check-inline": x.field.horizontal })}>
                                    <input className="form-check-input" disabled={Boolean(x.disabled)} type="radio" name={x.name} checked={x.value === y} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(y, x) : null} />
                                    <label className="form-check-label">{y}</label>
                                </div>
                            )
                        }
                        <small className="form-text text-danger">{(this.state.formSubmitted && !x.valid) && x.errMsg}</small>
                    </div>
                break;

            default:
                fieldCode = null;
        }

        return fieldCode;
    }

    doNothing(){}

    render() {
        return (
            <form className={classNames({ "col-12": !this.props.className }, this.props.className)} onSubmit={(e) => this.onFormSubmit(e)}>
                <div className="row" onClick={e => {this.props.onClick && this.props.onClick(e)}}>
                    {
                        this.state.form.map(x => this.generateField(x))
                    }
                    <div className={classNames({ "col-12": !this.props.footerClassName }, this.props.footerClassName)}>
                        {this.props.formButtons ?
                            this.props.formButtons :
                            <button type="submit" className="btn btn-outline-primary float-right">Submit</button>
                        }
                    </div>
                </div>
                <div className="clearfix"></div>
            </form>
        );
    }
}

export class FormElem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { elemObj: props.elemObj }
    }

    setElemObj(obj){
        this.setState({elemObj: obj});
    }

    getElemObj(){
        return JSON.parse(JSON.stringify(this.state));
    }

    onFormChange(val, ...field) {
        let { form } = this.state,
            newFormObj = form.map(x => {
                if (x.name === field[0].name) {
                    if (x.field.type === "checkbox") {
                        x.field.options.map(y => {
                            if (y.label === field[1].label) {
                                y.checked = val;
                            }
                            return y
                        })
                        x.valid = Boolean(x.field.options.filter(y => y.checked).length)
                    }
                    else if (x.field.type === "radio") {
                        x.value = val;
                        x.valid = Boolean(x.value);
                    }
                    else if (x.field.type === "datepicker") {
                        x.value = new Date(val).getTime();
                        x.valid = x.required ? Boolean(val) : true;
                        x.errMsg = "";
                    }
                    else if (x.field.type === "confirm") {
                        x.value = val;
                        x.valid = (val === form.find(d => (d.name === x.field.pair)).value);
                        x.errMsg = x.valid ? "" : `${x.field.pair} does not match`
                    }
                    else {
                        x.value = val;
                        x.errMsg = "";
                        x.valid = true;

                        if (val === "" && x.required) {
                            x.valid = false;
                        }

                        if (!(val === "" && !x.required)) {
                            for (let y of x.check) {
                                if (!new RegExp(y.regex).test(val)) {
                                    x.errMsg = y.message;
                                    x.valid = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                return x;
            });
        newFormObj = newFormObj.map(x => {
            if (x.field.type === "confirm") {
                x.valid = (x.value === form.find(d => (d.name === x.field.pair)).value);
                x.errMsg = x.valid ? "" : `${x.field.pair} does not match`
            }
            return x
        });
        this.setState({ form: newFormObj });
    }

    render() {
        let x = this.state.elemObj;

        switch (x.field.type) {

            case "text":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="text" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                )

            case "password":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="password" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                )

            case "confirm":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <input type="text" disabled={Boolean(x.disabled)} className="form-control" value={x.value} aria-label={x.name} placeholder={x.placeholder} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null} />
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                )

            case "datepicker":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <DatePicker selected={Boolean(x.value) ? new Date(x.value) : ""} onChange={e => this.onFormChange(e, x)} className="form-control" />
                        <small className="form-text text-danger">{this.state.formSubmitted && x.errMsg}</small>
                    </div>
                )

            case "select":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        <select className="form-control" disabled={Boolean(x.disabled)} value={x.value} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.value, x) : null}>
                            {
                                x.field.options.map(y =>
                                    <option key={y.value} value={y.value}>{y.label}</option>
                                )
                            }
                        </select>
                        <small className="form-text text-danger">{(this.state.formSubmitted || x.value !== "") && x.errMsg}</small>
                    </div>
                )

            case "checkbox":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate d-block">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        {
                            x.field.options.map(y =>
                                <div key={y.label} className={classNames("form-check", { "form-check-inline": x.field.horizontal })}>
                                    <input className="form-check-input" disabled={Boolean(x.disabled)} type="checkbox" checked={y.checked} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(e.target.checked, x, y) : null} />
                                    <label className="form-check-label">{y.label}</label>
                                </div>
                            )
                        }
                        <small className="form-text text-danger">{(this.state.formSubmitted && !x.valid) && x.errMsg}</small>
                    </div>
                )

            case "radio":
                return (
                    <div key={x.name} className={classNames("form-group", x.gridClass)}>
                        <label className="text-truncate d-block">{x.name}{x.required && <span className="text-danger font-weight-bold">*</span>}</label>
                        {
                            x.field.options.map(y =>
                                <div key={y} className={classNames("form-check", { "form-check-inline": x.field.horizontal })}>
                                    <input className="form-check-input" disabled={Boolean(x.disabled)} type="radio" name={x.name} checked={x.value === y} onChange={(e) => Boolean(!x.disabled) ? this.onFormChange(y, x) : null} />
                                    <label className="form-check-label">{y}</label>
                                </div>
                            )
                        }
                        <small className="form-text text-danger">{(this.state.formSubmitted && !x.valid) && x.errMsg}</small>
                    </div>
                )

            default:
                return null;
        }
    }
}

/*
    <Form
        fields={formElems}
        className=""
        formButtons={*Should contain atleast one button with "type=submit"*}
        onSubmit={*Function to call onsubmit of valid form*}
    />

    let formElems = [
        {
            name: 'First Name',
            placeholder: 'First Name',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            gridClass: "col-12 col-md-6 col-lg-6",
            check: [
                {
                    regex: /^.{3,30}$/,
                    message: "Should be 3 - 30 characters"
                },
                {
                    regex: /^[a-zA-Z]{3,30}$/,
                    message: "First name should not have any special characters, numerics or spaces"
                }
            ]
        },
        {
            name: 'Last Name',
            placeholder: 'Last Name',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "password"
            },
            gridClass: "col-12 col-md-6 col-lg-6",
            check: [
                {
                    regex: /^.{2,30}$/,
                    message: "Should be 2 - 30 characters"
                },
                {
                    regex: /^[a-zA-Z]{2,30}$/,
                    message: "Last name should not have any special characters, numerics or spaces"
                }
            ]
        },
        {
            name: 'Dropdown',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "select",
                options: [
                    {
                        label: 'Select an option',
                        value: ''
                    },
                    {
                        label: 'option 1',
                        value: '1'
                    },
                    {
                        label: 'option 2',
                        value: '2'
                    },
                    {
                        label: 'option 3',
                        value: '3'
                    }
                ]
            },
            gridClass: "col-12 col-md-6 col-lg-6",
            check: [
                {
                    regex: /^[0-9]$/,
                    message: "Please select an option"
                }
            ]
        },
        {
            name: 'Checkbox group',
            value: '',
            errMsg: 'Select atleast one',
            required: true,
            valid: false,
            field: {
                type: "checkbox",
                horizontal: true,
                options: [
                    {
                        label: 'option 1',
                        checked: false
                    },
                    {
                        label: 'option 2',
                        checked: false
                    },
                    {
                        label: 'option 3',
                        checked: false
                    }
                ]
            },
            gridClass: "col-12 col-md-6 col-lg-6"
        },
        {
            name: 'Radio group',
            value: '',
            errMsg: 'Select an option',
            required: true,
            valid: false,
            field: {
                type: "radio",
                horizontal: true,
                options: [
                    'option 1',
                    'option 2',
                    'option 3'
                ]
            },
            gridClass: "col-12 col-md-6 col-lg-6"
        },
        {
            name: 'Password',
            placeholder: 'Insert Password',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "password"
            },
            gridClass: "col-12",
            check: [
                {
                    regex: '^.{2,}$',
                    message: "Password should be atleast 2 characters"
                },
                {
                    regex: '^[a-zA-Z0-9]{2,}$',
                    message: "Password should not have any special characters, spaces"
                }
            ]
        },
        {
            name: 'Confirm Password',
            placeholder: 'Insert Password',
            value: '',
            errMsg: "Password doesn't match",
            required: true,
            valid: false,
            field: {
                type: "confirm",
                pair: "Password"
            },
            gridClass: "col-12"
        },
        {
            elementCode: <ElementCode />,
            valid: //validity
        }
    ];

*/
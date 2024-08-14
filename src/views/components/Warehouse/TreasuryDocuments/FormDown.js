import { useEffect, useState } from "react";
import Breadcrumbs from "../../Breadcrumbs";
import AddItemButton from "./AddItemButton";
import Datetime from 'react-datetime';
import moment from 'moment';
import Swal from 'sweetalert2';

import { formatDateOnChange, getAllData } from "../../../../utils/SamuiUtils";

const FormDown = ({ name }) => {

    const [formMasterList, setFormMasterList] = useState({
        recDueDate: moment()
    });
    const [whDataList, setWhDataList] = useState([]);
    const [selectedFromWarehouse, setSelectedFromWarehouse] = useState('');
    const [selectedToWarehouse, setSelectedToWarehouse] = useState('');
    const [apiOnHand, setApiOnHand] = useState([]);
    // const comp_id = window.localStorage.getItem('company');
    // console.debug('apiOnHand =>', apiOnHand);

    const handleFromChange = (e) => {
        const selectedValue = e.target.value;
        console.debug('Selected From Warehouse:', selectedValue);
        if (selectedValue === selectedToWarehouse) {
            Swal.fire({
                icon: 'error',
                title: 'แจ้งเตือน',
                text: 'คุณไม่สามารถเลือกคลังสินค้าเดียวกันได้!',
            });
        } else {
            setSelectedFromWarehouse(selectedValue);
        }
    };

    const handleToChange = (e) => {
        const selectedValue = e.target.value;
        console.debug('Selected To Warehouse:', selectedValue);
        if (selectedValue === selectedFromWarehouse) {
            Swal.fire({
                icon: 'error',
                title: 'แจ้งเตือน',
                text: 'คุณไม่สามารถเลือกคลังสินค้าเดียวกันได้!',
            });
        } else {
            setSelectedToWarehouse(selectedValue);
        }
    };

    // console.debug('comp_id =>', comp_id);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        const whDataList = await getAllData('Tb_Set_WH', 'ORDER BY WH_Code ASC');
        if (whDataList && whDataList.length > 0) {
            // console.debug('whDataList =>', whDataList);
            setWhDataList(whDataList);
        }

        const apiOnHand = await getAllData('API_1101_WH_ITEM_ONHAND', 'ORDER BY WH_Name, Item_Code');
        if (apiOnHand && apiOnHand.length > 0) {
            setApiOnHand(apiOnHand);
        }

    };

    const handleChangeDateMaster = (value, name) => {
        // ตรวจสอบว่า value เป็น moment object หรือไม่
        const newValue = value && value instanceof moment ? value.format('YYYY-MM-DD') : value;
        // อัปเดตค่าใน formMasterList
        setFormMasterList((prev) => ({
            ...prev,
            [name]: formatDateOnChange(newValue),
        }));
    };

    return <>
        <Breadcrumbs page={'ADJ67080080'} items={[
            { name: 'คลังสินค้า', url: '/Warehouse' },
            { name: name, url: '/treasury-documents' },
            { name: "สร้างใบปรับปรุงสินค้า", url: '#' }
        ]} />

        <div className="body">
            <div class="container-fluid my-4">
                <h5 className="">ใบปรับปรุงสินค้า</h5>
                <div className="row mb-1">
                    {/* <div className="col-3">
                        <div className="d-flex">
                            <label>เลขที่เอกสาร : </label>
                            <input type="text" className="form-control" placeholder="" />
                        </div>
                    </div> */}
                    <div className="col-3">
                        <div className="d-flex">
                            <label>วันที่เอกสาร : </label>
                            <Datetime
                                className="input-spacing-input-date"
                                name="recDueDate"
                                value={formMasterList.recDueDate || null}
                                onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
                                dateFormat="DD-MM-YYYY"
                                timeFormat={false}
                                inputProps={{ readOnly: true, disabled: false }}
                            />
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="d-flex">
                            {/* <label className="">ลูกค้า : </label>
                            <input type="text" className="form-control" placeholder="" /> */}
                            <label>ผู้ขาย</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                />
                                <button className="btn btn-outline-secondary">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="d-flex">
                            <label className="">วันที่สร้าง : </label>
                            <Datetime
                                className="input-spacing-input-date"
                                name="recDueDate"
                                value={formMasterList.recDueDate || null}
                                onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
                                dateFormat="DD-MM-YYYY"
                                timeFormat={false}
                                inputProps={{ readOnly: true, disabled: true }}
                            />
                        </div>
                    </div>

                </div>
                <div className="row mb-1">
                    <div className="col-3">
                        <div className="d-flex">
                            <label>วันที่จัดส่ง : </label>
                            <Datetime
                                className="input-spacing-input-date"
                                name="recDueDate"
                                value={formMasterList.recDueDate || null}
                                onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
                                dateFormat="DD-MM-YYYY"
                                timeFormat={false}
                                inputProps={{ readOnly: true, disabled: false }}
                            />
                        </div>
                    </div>
                    {/* <div className="col-3">
                        <div className="d-flex">
                            <label>ไปคลัง :</label>
                            <select class="form-select" onChange={handleToChange}>
                                {whDataList.map((warehouse) => (
                                    <option key={warehouse.WH_Id} value={warehouse.WH_Id}
                                    // disabled={warehouse.WH_Id === selectedToWarehouse}
                                    >
                                        {warehouse.WH_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div> */}
                    {/* <div className="col-3">
                        <div className="d-flex">
                            <label></label>
                            <input type="text" className="form-control" placeholder="" />
                        </div>
                    </div> */}
                    <div className="col-3">
                        <div className="d-flex">
                            <label>สร้างโดย : </label>
                            <input type="text" className="form-control" placeholder="Company" />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">

                    <div className="col-3">
                        <div className="d-flex">
                            <label>จากคลัง : </label>
                            <select class="form-select" onChange={handleFromChange}>
                                {whDataList.map((warehouse) => (
                                    <option key={warehouse.WH_Id} value={warehouse.WH_Id}
                                    >
                                        {warehouse.WH_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="d-flex">
                            <label>หมายเหตุ : </label>
                            <input type="text" className="form-control" placeholder="" />
                        </div>
                    </div>
                    {/* <div className="col-3">
                        <div className="d-flex">
                            <label></label>
                            <input type="text" className="form-control" placeholder="" />
                        </div>
                    </div> */}
                    {/* <div className="col-3">
                        <div className="d-flex">
                            <label>ประเภทเอกสาร : </label>
                            <select class="form-select">
                                <option selected>Adjust</option>
                                <option value="1">Transfer</option>
                            </select>
                        </div>
                    </div> */}
                </div>
                <hr />
                <div className="row">
                    <div className="col-4">
                        {/* Component Modal */}
                        <AddItemButton apiOnHand={apiOnHand} />
                        <button className="btn text-white w-60 mx-4" style={{
                            backgroundColor: 'red',
                            fontSize: '14px'
                        }}>
                            <i className="fa fa-minus me-2" aria-hidden="true"></i> ลบรายการ
                        </button>
                    </div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                </div>
            </div>
            {/*  */}
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table id="basic-datatables" className="table table-striped table-hover">
                                        <thead className="thead-dark">
                                            <tr>
                                                <th className="text-center" style={{ width: '1%' }}>Line</th>
                                                <th className="text-center" style={{ width: '4%' }}>รหัสสินค้า</th>
                                                <th className="text-center" style={{ width: '10%' }}>ชื่อสินค้า</th>
                                                <th className="text-center" style={{ width: '2%' }}>Todo</th>
                                                <th className="text-center" style={{ width: '2%' }}>เพิ่ม</th>
                                                <th className="text-center" style={{ width: '2%' }}>ลด</th>
                                                <th className="text-center" style={{ width: '2%' }}>หน่วย</th>
                                                <th className="text-center" style={{ width: '2%' }}>จำนวนเงิน</th>


                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* map */}
                                            <tr>
                                                <td className="text-center">1
                                                </td>
                                                <td className="text-center">000123</td>
                                                <td className="">12 เดือนของไทย</td>
                                                <td className="text-center">AI</td>
                                                <td className="text-center">
                                                    <input type="text" className="form-control" />
                                                </td>
                                                <td className="text-center">
                                                    <input type="text" className="form-control" />
                                                </td>
                                                <td className="text-center">เล่ม</td>
                                                <td className="text-center">99.00</td>
                                            </tr>
                                            {/* <tr>
                                                <td colSpan={11}>
                                                    <div className="text-center">
                                                        <h5>ไม่พบข้อมูล</h5>
                                                    </div>
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="container-fluid my-2">
                            <div className="row">
                                <div className="col-12 text-end">
                                    <div className="d-inline-block me-2">
                                        <button className="btn text-white" style={{
                                            backgroundColor: 'green',
                                            fontSize: '16px'
                                        }}>
                                            <i className="fa fa-plus me-2" aria-hidden="true"></i> บันทึก
                                        </button>
                                    </div>
                                    <div className="d-inline-block">
                                        <button className="btn text-white" style={{
                                            backgroundColor: 'red',
                                            fontSize: '16px'
                                        }}>
                                            <i className="fa fa-times-circle me-2" aria-hidden="true"></i> ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default FormDown;

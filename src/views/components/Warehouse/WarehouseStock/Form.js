import React, { useState, useEffect } from 'react';
import './../../../../assets/css/purchase/form.css';
import Axios from 'axios';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import WhModal from '../../Modal/WhModal'

// Utils
import { setCreateDateTime } from '../../../../utils/SamuiUtils';

function Form({ name, masterList, tbSetWh, apiOnHand }) {
    const [dataItem, setDataItem] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [warehouseId, setWarehouseId] = useState("");
    console.debug('dataItem =>', dataItem);
    // Table 3
    const ApiGetHistory = async (itemId) => {
        try {
            const response = await Axios.post(
                `${process.env.REACT_APP_API_URL}/api/get-item-history`,
                { item_id: itemId },
                {
                    headers: { key: process.env.REACT_APP_ANALYTICS_KEY } // Headers
                }
            );
            setHistoryList(response.data);
        } catch (error) {
            console.error("Error fetching history data:", error);
            return null;
        }
    };

    // From WarehouseTabs 
    const [activeTab, setActiveTab] = useState("history");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // WarehouseProducts
    const getByNameProduct = async (Item_Id, WH_Id, Item_Code, Item_Name) => {
        // console.debug('getByNameProduct item =>', Item_Id, WH_Id, Item_Code, Item_Name);

        // Table 2
        const data = await ApiOnHand(Item_Id, WH_Id);
        // console.debug('ApiOnHand itemId =>', Item_Id);
        // console.debug('ApiOnHand WH_Id =>', WH_Id);
        setWarehouseId(WH_Id);
        setDataItem(data);

        // Table 3
        ApiGetHistory(Item_Id, WH_Id);
        // console.debug('ApiGetHistory itemId =>', Item_Id);
        // console.debug('ApiGetHistory  WH_Id =>', WH_Id);
    };

    // Table 2
    const ApiOnHand = async (Item_Id) => {
        return apiOnHand.filter((item) => item.Item_Id === Item_Id);
    };

    // WarehouseProductsItem
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        const newFilteredItems = dataItem.filter(item => item.Item_Onhand > 0);
        // console.debug('Filtered items => ', newFilteredItems); 
        setFilteredItems(newFilteredItems);
    }, [dataItem]);

    // WarehouseTable
    const [selectedWhId, setSelectedWhId] = useState(1);
    const [filteredApiOnHandList, setFilteredApiOnHandList] = useState(apiOnHand);

    useEffect(() => {
        // ตั้งค่า selectedWhId เป็นค่าเริ่มต้นเป็นคลังแรกใน tbSetWh เมื่อคอมโพเนนต์ถูกโหลดครั้งแรก
        // หากมีคลังใน tbSetWh, ฟังก์ชันจะตั้งค่า selectedWhId ให้เป็น WH_Id ของคลังแรกใน tbSetWh (tbSetWh[0].WH_Id).
        if (tbSetWh.length > 0) {
            setSelectedWhId(tbSetWh[0].WH_Id);
        }
    }, [tbSetWh]);

    useEffect(() => {
        // แปลง selectedWhId จาก string ให้เป็น integer
        const warehouseId = parseInt(selectedWhId, 10);
        // หากเงื่อนไขเป็นจริง (selectedWhId ไม่เป็น null)
        const updatedApiOnHandList = selectedWhId !== null
            // จะทำการกรองรายการประวัติ (apiOnHand) โดยเลือกเฉพาะรายการที่มีค่า WH_Id ตรงกับ warehouseId
            ? apiOnHand.filter(item => item.WH_Id === warehouseId)
            // หากเงื่อนไขเป็นเท็จ (selectedWhId เป็น null) จะเก็บรายการประวัติทั้งหมด (apiOnHand) โดยไม่กรอง
            : apiOnHand;
        // อัปเดตสถานะของรายการประวัติที่กรองแล้ว
        setFilteredApiOnHandList(updatedApiOnHandList);
    }, [selectedWhId, apiOnHand]);

    // WarehouseHistory
    const [filteredHistoryList, setFilteredHistoryList] = useState([]);
    const [showWhModal, setShowWhModal] = useState(false);
    const handleWhShow = () => setShowWhModal(true);
    const handleWhClose = () => setShowWhModal(false);

    useEffect(() => {
        // แปลง selectedWhId จาก string ให้เป็น integer
        const warehouseId = parseInt(selectedWhId, 10);
        // หากเงื่อนไขเป็นจริง (selectedWhId ไม่เป็น null)
        const updatedHistoryList = selectedWhId !== null
            // จะทำการกรองรายการประวัติ (historyList) โดยเลือกเฉพาะรายการที่มีค่า WH_Id ตรงกับ warehouseId
            ? historyList.filter(item => item.WH_Id === warehouseId)
            // หากเงื่อนไขเป็นเท็จ (selectedWhId เป็น null) จะเก็บรายการประวัติทั้งหมด (historyList) โดยไม่กรอง
            : historyList;
        // อัปเดตสถานะของรายการประวัติที่กรองแล้ว
        // Sorting the data in descending order based on STC_Balance
        // const sortedHistoryList = updatedHistoryList.sort((a, b) => b.STC_Balance - a.STC_Balance);
        setFilteredHistoryList(historyList);
    }, [selectedWhId, historyList]);

    return (
        <>
            <Breadcrumbs page={'คลังสินค้า'} items={[
                { name: 'คลังสินค้า', url: '/Warehouse' },
                { name: name, url: '/warehouse-stock' },
                { name: "สร้าง" + name, url: '#' },
            ]} />
            <div className='container-fluid my-2'>
                <div className="row">
                    <div className="col-4">
                        <div className="d-flex align-items-center">
                            <h5 className="text-nowrap card-title mb-0 me-3">ค้นหาสินค้า</h5>
                            <input type="text" className="form-control" />
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='d-flex'>
                            <select className="form-select" aria-label="Default select example" style={{ maxWidth: '190px' }}>
                                <option selected>แสดงยอดคงเหลือ > 0</option>
                                <option value="1">แสดงยอดคงเหลือ > = 0</option>
                                <option value="2">แสดงยอดคงเหลือ = 0</option>
                                <option value="3">แสดงทุกรายการ</option>
                            </select>
                            <i className="fa fa-search fs-4 mx-4" style={{ cursor: 'pointer' }} aria-hidden="true"></i>
                            <button className="btn text-white mx-1" style={{ backgroundColor: 'rgb(239, 108, 0)' }}>
                                <i className="fa fa-file-excel me-1" aria-hidden="true"></i> Export สินค้ายอดคงเหลือ
                            </button>
                            <button className="btn text-white mx-3" style={{ backgroundColor: 'rgb(239, 108, 0)' }}>
                                <i className="fa fa-warehouse me-1" aria-hidden="true"></i> Export สินค้าแยกตามคลัง
                            </button>
                        </div>
                    </div>
                    <div className='col-2'> </div>
                </div>
            </div>
            {/*  */}
            <div className="row mt-1">
                <div className="col-5">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                    <table id="basic-datatables" className="table table-striped table-hover">
                                        <thead className="thead-dark">
                                            {/* <tr style={{position: 'fixed'}}> */}
                                            <tr>
                                                <th className="text-center" style={{ width: '2%' }}>Line</th>
                                                <th className="text-center" style={{ width: '10%' }}>รหัสสินค้า</th>
                                                <th className="text-center" style={{ width: '23%' }}>ชื่อสินค้า</th>
                                                <th className="text-center" style={{ width: '8%' }}>หน่วย</th>
                                                <th className="text-center" style={{ width: '8%' }}>คงเหลือ</th>
                                                <th className="text-center" style={{ width: '8%' }}>จุดสั่งซื้อ</th>
                                                <th className="text-center" style={{ width: '8%' }}>จุดสูงสุด</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {masterList.map((item, index) => (
                                                <tr key={item.Item_Id} onClick={() => getByNameProduct(item.Item_Id, item.Item_WH, item.Item_Code, item.Item_Name)}

                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="text-center">{index + 1}</td>
                                                    <td className="text-center">{item.Item_Code}</td>
                                                    <td className="text-left">{item.Item_Name}</td>
                                                    <td className="text-center">{item.Item_Unit_ST}</td>
                                                    <td className="text-center">{item.Reft_ItemOnhand}</td>
                                                    <td className="text-center">{item.Item_PoPoint}</td>
                                                    <td className="text-center">{item.Item_MaxOnhand}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-7">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table id="basic-datatables" className="table table-striped table-hover">
                                        <thead className="thead-dark">
                                            <tr>
                                                {/* <th className="text-center" style={{ width: '2%' }}>#</th> */}
                                                <th className="text-center" style={{ width: '10%' }}>รหัสสินค้า</th>
                                                <th className="text-center" style={{ width: '23%' }}>ชื่อสินค้า</th>
                                                <th className="text-center" style={{ width: '6%' }}>คงเหลือ</th>
                                                <th className="text-center" style={{ width: '13%' }}>WH_Name</th>
                                                <th className="text-center" style={{ width: '4%' }}>Last_STC_Date</th>
                                                <th className="text-center" style={{ width: '4%' }}>Last_STC_SEQ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map((item, index) => (
                                                    <tr key={item.Item_Id}>
                                                        {/* <td className="text-center">{index + 1}</td> */}
                                                        <td className="text-center">{item.Item_Code}</td>
                                                        <td className="text-left">{item.Item_Name}</td>
                                                        <td className="text-center">{item.Item_Onhand}</td>
                                                        <td className="text-center">{item.WH_Name}</td>
                                                        <td className="text-center">{item.Last_STC_Date}</td>
                                                        <td className="text-center">{item.Last_STC_SEQ}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6}>
                                                        <center>
                                                            <h5>ไม่พบข้อมูล</h5>
                                                        </center>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className="row mt-2">
                <div className="col-12">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <ul className="nav nav-tabs">
                                    <li className="nav-item">
                                        <a style={{ cursor: 'pointer', color: '#EF6C00' }}
                                            className={`nav-link ${activeTab === "home" ? "active" : ""}`}
                                            onClick={() => handleTabClick("home")}
                                        >
                                            สินค้าคงคลัง
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a style={{ cursor: 'pointer', color: '#EF6C00' }}
                                            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                                            onClick={() => handleTabClick("history")}
                                        >
                                            ประวัติสินค้า
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="tab-content mt-3">
                                <div
                                    className={`tab-pane fade ${activeTab === "home" ? "show active" : ""}`}
                                    role="tabpanel">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <div className="col-4 d-flex align-items-center">
                                                    <h4 className="card-title mb-0 me-2">เลือกคลัง</h4>
                                                    <select
                                                        style={{ width: '200px' }}
                                                        className="form-select"
                                                        value={selectedWhId || ''}
                                                        onChange={(e) => setSelectedWhId(e.target.value)}
                                                    >
                                                        {tbSetWh.map((ware) => (
                                                            <option key={ware.WH_Id} value={ware.WH_Id}>
                                                                {ware.WH_Name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-4 d-flex align-items-center">
                                                    <h4 className="card-title mb-0 me-2">ค้นหา</h4>
                                                    <div className="input-group w-50">
                                                        <input type="text" className="form-control" />
                                                        <button className="btn btn-outline-secondary">
                                                            <i className="fas fa-search"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-4 d-flex align-items-center">
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table id="basic-datatables" className="table table-striped table-hover">
                                                        <thead className="thead-dark">
                                                            <tr>
                                                                <th className="text-center" style={{ width: '2%' }}>รหัสสินค้า</th>
                                                                <th className="text-center" style={{ width: '20%' }}>ชื่อสินค้า</th>
                                                                <th className="text-center" style={{ width: '1%' }}>คงเหลือ</th>
                                                                <th className="text-center" style={{ width: '4%' }}>WH_Name</th>
                                                                <th className="text-center" style={{ width: '2%' }}>Last_STC_Date</th>
                                                                <th className="text-center" style={{ width: '2%' }}>Last_STC_SEQ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredApiOnHandList.length > 0 ? (
                                                                filteredApiOnHandList.map((item, index) => (
                                                                    <tr key={item.Item_Id}>
                                                                        <td className="text-center">{item.Item_Code}</td>
                                                                        <td className="text-left">{item.Item_Name}</td>
                                                                        <td className="text-center">{item.Item_Onhand}</td>
                                                                        <td className="text-center">{item.WH_Name}</td>
                                                                        <td className="text-center">{item.Last_STC_Date}</td>
                                                                        <td className="text-center">{item.Last_STC_SEQ}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={10}>
                                                                        <center>
                                                                            <h5>ไม่พบข้อมูล</h5>
                                                                        </center>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`tab-pane fade ${activeTab === "history" ? "show active" : ""}`}
                                    role="tabpanel"
                                >
                                    {/* WarehouseHistory */}
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <div className="container-fluid">
                                                    <div className="d-flex flex-row">
                                                        <div className="col-3">
                                                            <div className="d-flex">
                                                                <h4 className="card-title mb-0 me-2">เลือกคลัง</h4>
                                                                <select
                                                                    style={{ width: '200px' }}
                                                                    className="form-select"
                                                                    onChange={(e) => setSelectedWhId(e.target.value)}
                                                                >
                                                                    {tbSetWh.map((ware) => (
                                                                        <option key={ware.WH_Id} value={ware.WH_Id}>
                                                                            {ware.WH_Name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className='col-4'>
                                                            <div className="radio-inline">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="radioOptions" value="" checked
                                                                />
                                                                <label className="form-check-label">แสดง STC ปีปัจจุบันเท่านั้น</label>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="radioOptions" value=""

                                                                />
                                                                <label className="form-check-label">แสดง STC ตั้งแต่เริ่มต้น</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-3 mx-5">
                                                            <div className='d-flex'>
                                                                <h4 className="card-title mb-0 me-2">ค้นหา</h4>
                                                                <div className="input-group w-50">
                                                                    <input type="text" className="form-control" />
                                                                    <button className="btn btn-outline-secondary">
                                                                        <i className="fas fa-search"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-3 mx-2">
                                                            <div className='d-flex'>
                                                                <button className="btn text-white btn-lg" onClick={handleWhShow} style={{
                                                                    backgroundColor: 'rgb(239, 108, 0)',
                                                                }}>
                                                                    <i className="fa fa-edit me-1" aria-hidden="true"></i>         ปรับปรุงคลัง
                                                                </button>
                                                                {/* WhModal */}
                                                                <WhModal showWhModal={showWhModal} handleWhClose={handleWhClose} itemDetailModal={filteredHistoryList[0]} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>


                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table id="basic-datatables" className="table table-striped table-hover">
                                                        <thead className="thead-dark">
                                                            <tr>
                                                                <th className="text-center" style={{ width: '1%' }}>Line</th>
                                                                <th className="text-center" style={{ width: '6%' }}>รหัสสินค้า</th>
                                                                <th className="text-center" style={{ width: '18%' }}>ชื่อสินค้า</th>
                                                                <th className="text-center" style={{ width: '1%' }}>Doc_Type</th>
                                                                <th className="text-center" style={{ width: '4%' }}>จำนวนคงเหลือ</th>
                                                                <th className="text-center" style={{ width: '5%' }}>วันที่ทำรายการ</th>
                                                                <th className="text-center" style={{ width: '6%' }}>WH</th>
                                                                <th className="text-center" style={{ width: '5%' }}>Doc_No</th>
                                                                <th className="text-center" style={{ width: '5%' }}>Doc_NoRef</th>
                                                                <th className="text-center" style={{ width: '5%' }}>STC_SEQ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredHistoryList.length > 0 ? (
                                                                filteredHistoryList.map((item, index) => (
                                                                    <tr key={item.STC_Id}>
                                                                        <td className="text-center">{index + 1}</td>
                                                                        <td className="text-center">{item.Item_Code}</td>
                                                                        <td className="text-left">{item.Item_Name}</td>
                                                                        <td className="text-center">{item.Doc_Type}</td>
                                                                        <td className="text-center">{item.STC_Balance}</td>
                                                                        <td className="text-center">{setCreateDateTime(item.STC_Date)}</td>
                                                                        <td className="text-center">{item.WH_Name}</td>
                                                                        <td className="text-center">{item.Doc_No}</td>
                                                                        <td className="text-center">{item.Doc_NoRef}</td>
                                                                        <td className="text-center">{item.STC_SEQ}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={10}>
                                                                        <center>
                                                                            <h5>ไม่พบข้อมูล</h5>
                                                                        </center>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div>
                </div>
            </div>
        </>
    );
}

export default Form;

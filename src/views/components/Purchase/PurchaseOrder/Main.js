import React, { useState, useEffect } from 'react';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import DataTable from '../../Content/DataTable';

// Utils
import { getAlert } from '../../../../utils/SamuiUtils';

function Main({ masterList, detailList, statusColours, statusPaidColours, statusReceiveColours, name, onPageInsert, onRowSelected }) {
    const [dataMasterList, setDataMasterList] = useState([]);
    const [dataDetailList, setDataDetailList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(16);

    // StatusColours
    const [countWaitApprove, setCountWaitApprove] = useState(0);
    const [countInProgress, setCountInProgress] = useState(0);
    const [countCancel, setCountCancel] = useState(0);
    const [countNotApprove, setCountNotApprove] = useState(0);
    const [countClose, setCountClose] = useState(0);

    // StatusPaidColours
    const [countWaitPaid, setCountWaitPaid] = useState(0);
    const [countOverduePaid, setCountOverduePaid] = useState(0);
    const [countPaidInFull, setCountPaidInFull] = useState(0);

    // StatusReceiveColours
    const [countWaitProduct, setCountWaitProduct] = useState(0);
    const [countOverdueProduct, setCountOverdueProduct] = useState(0);
    const [countReceiveProduct, setCountReceiveProduct] = useState(0);

    // ใช้สำหรับค้นหาเอกสาร
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        initialize();
    }, [masterList, detailList]);

    useEffect(() => {
        filterItems();
    }, [searchTerm, dataMasterList]);

    const initialize = async () => {
        try {
            if (masterList && masterList.length > 0) {
                setDataMasterList(masterList);

                // นับข้อมูลสถานะ
                let statusCounts = {
                    'รออนุมัติ': 0,
                    'กำลังดำเนินการ': 0,
                    'ไม่อนุมัติ': 0,
                    'ปิดงาน': 0,
                    'ยกเลิก': 0
                };

                let statusPaidCounts = {
                    'รอจ่าย': 0,
                    'ค้างจ่าย': 0,
                    'จ่ายครบ': 0
                };

                let statusReceiveCounts = {
                    'รอรับสินค้า': 0,
                    'ค้างรับสินค้า': 0,
                    'รับสินค้าครบ': 0
                };

                masterList.forEach(data => {
                    if (data.DocStatus_Name) {
                        statusCounts[data.DocStatus_Name] = (statusCounts[data.DocStatus_Name] || 0) + 1;
                    }
                });

                masterList.forEach(data => {
                    if (data.Doc_Status_PaidName) {
                        statusPaidCounts[data.Doc_Status_PaidName] = (statusPaidCounts[data.Doc_Status_PaidName] || 0) + 1;
                    }
                });

                masterList.forEach(data => {
                    if (data.Doc_Status_ReceiveName) {
                        statusReceiveCounts[data.Doc_Status_ReceiveName] = (statusReceiveCounts[data.Doc_Status_ReceiveName] || 0) + 1;
                    }
                });

                setCountWaitApprove(statusCounts['รออนุมัติ']);
                setCountInProgress(statusCounts['กำลังดำเนินการ']);
                setCountNotApprove(statusCounts['ไม่อนุมัติ']);
                setCountClose(statusCounts['ปิดงาน']);
                setCountCancel(statusCounts['ยกเลิก']);

                setCountWaitPaid(statusPaidCounts['รอจ่าย']);
                setCountOverduePaid(statusPaidCounts['ค้างจ่าย']);
                setCountPaidInFull(statusPaidCounts['จ่ายครบ']);

                setCountWaitProduct(statusReceiveCounts['รอรับสินค้า']);
                setCountOverdueProduct(statusReceiveCounts['ค้างรับสินค้า']);
                setCountReceiveProduct(statusReceiveCounts['รับสินค้าครบ']);

                setCurrentPage(1); // รีเซ็ตหน้าเมื่อมีข้อมูลใหม่
            }

            if (detailList && detailList.length > 0) {
                setDataDetailList(detailList);
            }
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const filterItems = () => {
        if (searchTerm === '') {
            setFilteredItems(dataMasterList);
        } else {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const filtered = dataMasterList.filter(item =>
                Object.values(item).some(value =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(lowercasedSearchTerm)
                )
            );
            setFilteredItems(filtered);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // สามารถใช้กรองคำที่จะไม่ใช้ใน Counter Box ได้
    const filteredStatusColours = statusColours.filter(statusObj =>
        !['รออนุมัติ', 'ไม่อนุมัติ'].includes(statusObj.DocSetStaus_Name)
    );

    return (
        <>
            <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={name} items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/purchase-order' },
                ]} />
                <div className="d-flex align-items-center">
                    <form className="navbar-left navbar-form nav-search">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="ค้นหาเอกสาร..."
                                className="form-control"
                                style={{ paddingRight: '30px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="input-group-text">
                                <i className="fas fa-search"></i>
                            </span>
                        </div>
                    </form>
                    <button
                        onClick={onPageInsert}
                        className="btn btn-warning text-white ms-2"
                        type="button">
                        สร้าง{name} <i className="fa fa-plus"></i>
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-1">
                    <center>
                        <b>สถานะเอกสาร</b>
                    </center>
                    <br />
                    {filteredStatusColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'รออนุมัติ':
                                count = countWaitApprove;
                                break;
                            case 'กำลังดำเนินการ':
                                count = countInProgress;
                                break;
                            case 'ไม่อนุมัติ':
                                count = countNotApprove;
                                break;
                            case 'ปิดงาน':
                                count = countClose;
                                break;
                            case 'ยกเลิก':
                                count = countCancel;
                                break;
                            default:
                                count = 0;
                        }

                        return (
                            <div key={index} className="col-12 mb-3">
                                <div className="card text-center" style={{ backgroundColor: DocSetColour }}>
                                    <div className="card-body d-flex flex-column align-items-center text-white">
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '20px', textAlign: 'center' }}>{count}</b>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '16px', textAlign: 'center' }}>{DocSetStaus_Name}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <br />
                    <center>
                        <b>สถานะรอจ่าย</b>
                    </center>
                    <br />
                    {statusPaidColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'รอจ่าย':
                                count = countWaitPaid;
                                break;
                            case 'ค้างจ่าย':
                                count = countOverduePaid;
                                break;
                            case 'จ่ายครบ':
                                count = countPaidInFull;
                                break;
                            default:
                                count = 0;
                        }

                        return (
                            <div key={index} className="col-12 mb-3">
                                <div className="card text-center" style={{ backgroundColor: DocSetColour }}>
                                    <div className="card-body d-flex flex-column align-items-center text-white">
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '20px', textAlign: 'center' }}>{count}</b>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '16px', textAlign: 'center' }}>{DocSetStaus_Name}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <br />
                    <center>
                        <b>สถานะรับสินค้า</b>
                    </center>
                    <br />
                    {statusReceiveColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'รอรับสินค้า':
                                count = countWaitProduct;
                                break;
                            case 'ค้างรับสินค้า':
                                count = countOverdueProduct;
                                break;
                            case 'รับสินค้าครบ':
                                count = countReceiveProduct;
                                break;
                            default:
                                count = 0;
                        }

                        return (
                            <div key={index} className="col-12 mb-3">
                                <div className="card text-center" style={{ backgroundColor: DocSetColour }}>
                                    <div className="card-body d-flex flex-column align-items-center text-white">
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '20px', textAlign: 'center' }}>{count}</b>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <b style={{ fontSize: '16px', textAlign: 'center' }}>{DocSetStaus_Name}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <DataTable
                    currentItems={currentItems}
                    onRowSelected={onRowSelected}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                    dataMasterList={filteredItems}
                    itemsPerPage={itemsPerPage}
                    fieldMappings={{
                        no: 'Doc_No',
                        typeName: 'DocType_Name',
                        statusName: 'DocStatus_Name',
                        statusColor: 'DocStatus_Colour',
                        statusReceiveName: 'Doc_Status_ReceiveName',
                        statusReceiveColor: 'Doc_Status_ReceiveColour',
                        date: 'Doc_Date',
                        apCode: 'AP_Code',
                        apName: 'AP_Name',
                        dueDate: 'Doc_DueDate',
                        netTotal: 'NetTotal',
                        createdBy: 'Created_By_Name',
                        updatedBy: 'Update_By_Name'
                    }}
                />
            </div>
        </>
    );
}

export default Main;
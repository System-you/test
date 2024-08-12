import React, { useState, useEffect } from 'react';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import DataTable from '../../Content/DataTable';

// Utils
import { getAlert } from '../../../../utils/SamuiUtils';

function Main({ masterList, detailList, statusColours, name, onPageInsert, onRowSelected }) {
    const [dataMasterList, setDataMasterList] = useState([]);
    const [dataDetailList, setDataDetailList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [countWaitPay, setCountWaitPay] = useState(0);
    const [countPaid, setCountPaid] = useState(0);
    const [countCancel, setCountCancel] = useState(0);

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
                    'รอจ่าย': 0,
                    'จ่ายแล้ว': 0,
                    'ยกเลิก': 0
                };

                masterList.forEach(data => {
                    if (data.PayStatus_Name) {
                        statusCounts[data.PayStatus_Name] = (statusCounts[data.PayStatus_Name] || 0) + 1;
                    }
                });

                setCountWaitPay(statusCounts['รอจ่าย']);
                setCountPaid(statusCounts['จ่ายแล้ว']);
                setCountCancel(statusCounts['ยกเลิก']);
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

    return (
        <>
            <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={name} items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/purchase-voucher' },
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
                    {/* <center>
                        <b>สถานะเอกสาร</b>
                    </center>
                    <br /> */}
                    {statusColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'รอจ่าย':
                                count = countWaitPay;
                                break;
                            case 'จ่ายแล้ว':
                                count = countPaid;
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
                </div>
                <DataTable
                    currentItems={currentItems}
                    onRowSelected={onRowSelected}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                    dataMasterList={filteredItems}
                    itemsPerPage={itemsPerPage}
                    fieldMappings={{
                        no: 'Pay_No',
                        typeName: 'PO_DocTypeName',
                        statusName: 'PayStatus_Name',
                        statusColor: 'PayStatus_Colour',
                        date: 'Pay_Date',
                        apCode: 'AP_Code',
                        apName: 'AP_Name',
                        dueDate: 'Doc_DueDate',
                        netTotal: 'Total_Pay_Per',
                        createdBy: 'Created_By_Name',
                        updatedBy: 'Update_By_Name'
                    }}
                />
            </div>
        </>
    );
}

export default Main;
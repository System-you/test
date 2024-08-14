import React, { useState, useEffect } from 'react';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import DataTable from '../../Content/DataTable';

// Utils
import { getAlert } from '../../../../utils/SamuiUtils';

function Main({ masterList, statusColours, name, onPageInsert, onRowSelected }) {
    const [dataMasterList, setDataMasterList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(16);
    const [countWaitConfirm, setCountWaitConfirm] = useState(0);
    const [countConfirm, setCountConfirm] = useState(0);
    const [countDeposit, setCountDeposit] = useState(0);
    const [countCancel, setCountCancel] = useState(0);

    // ใช้สำหรับค้นหาเอกสาร
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        initialize();
    }, [masterList]);

    useEffect(() => {
        filterItems();
    }, [searchTerm, dataMasterList]);

    const initialize = async () => {
        try {
            if (masterList && masterList.length > 0) {
                setDataMasterList(masterList);

                // นับข้อมูลสถานะ
                let statusCounts = {
                    'รอยืนยัน': 0,
                    'ลค ยืนยันแล้ว': 0,
                    'จ่ายมัดจำแล้ว': 0,
                    'ยกเลิก': 0
                };

                masterList.forEach(data => {
                    if (data.DocStatus_Name) {
                        statusCounts[data.DocStatus_Name] = (statusCounts[data.DocStatus_Name] || 0) + 1;
                    }
                });

                setCountWaitConfirm(statusCounts['รอยืนยัน']);
                setCountConfirm(statusCounts['ลค ยืนยันแล้ว']);
                setCountDeposit(statusCounts['จ่ายมัดจำแล้ว']);
                setCountCancel(statusCounts['ยกเลิก']);
                setCurrentPage(1); // รีเซ็ตหน้าเมื่อมีข้อมูลใหม่
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
                    { name: name, url: '/deposit-document' },
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
                    {statusColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'รอยืนยัน':
                                count = countWaitConfirm;
                                break;
                            case 'ลค ยืนยันแล้ว':
                                count = countConfirm;
                                break;
                            case 'จ่ายมัดจำแล้ว':
                                count = countDeposit;
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
                        no: 'Doc_No',
                        typeName: 'DocType_Name',
                        statusName: 'DocStatus_Name',
                        statusColor: 'docsetcolour',
                        date: 'Doc_Date',
                        apCode: 'AR_Code',
                        apName: 'AR_Name',
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
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
    const [countWaitApprove, setCountWaitApprove] = useState(0);
    const [countApprove, setCountApprove] = useState(0);
    const [countNotApprove, setCountNotApprove] = useState(0);
    const [countCancel, setCountCancel] = useState(0);

    useEffect(() => {
        initialize();
    }, [masterList, detailList]);

    const initialize = async () => {
        try {
            if (masterList && masterList.length > 0) {
                setDataMasterList(masterList);

                // นับข้อมูลสถานะ
                let statusCounts = {
                    'รออนุมัติ': 0,
                    'อนุมัติ': 0,
                    'ไม่อนุมัติ': 0,
                    'ยกเลิก': 0
                };

                masterList.forEach(data => {
                    if (data.DocStatus_Name) {
                        statusCounts[data.DocStatus_Name] = (statusCounts[data.DocStatus_Name] || 0) + 1;
                    }
                });

                setCountWaitApprove(statusCounts['รออนุมัติ']);
                setCountApprove(statusCounts['อนุมัติ']);
                setCountNotApprove(statusCounts['ไม่อนุมัติ']);
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataMasterList.slice(indexOfFirstItem, indexOfLastItem);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(dataMasterList.length / itemsPerPage); i++) {
            pageNumbers.push(
                <li
                    key={i}
                    className={`paginate_button page-item ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    <a href="#" className="page-link">{i}</a>
                </li>
            );
        }
        return pageNumbers;
    };

    return (
        <>
            <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={name} items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/purchase-request' },
                ]} />
                <div className="d-flex align-items-center">
                    <form className="navbar-left navbar-form nav-search">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="ค้นหาเอกสาร..."
                                className="form-control"
                                style={{ paddingRight: '30px' }}
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
                            case 'รออนุมัติ':
                                count = countWaitApprove;
                                break;
                            case 'อนุมัติ':
                                count = countApprove;
                                break;
                            case 'ไม่อนุมัติ':
                                count = countNotApprove;
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
                    dataMasterList={dataMasterList}
                    itemsPerPage={itemsPerPage}
                    fieldMappings={{
                        no: 'Doc_No',
                        typeName: 'DocType_Name',
                        statusName: 'DocStatus_Name',
                        statusColor: 'docsetcolour',
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
import React, { useState, useEffect } from 'react';

// Components
import Breadcrumbs from '../../Breadcrumbs';

// CSS
import './../../../../assets/css/purchase/datatable.css';

// Utils
import { getAlert, formatCurrency, formatDate } from '../../../../utils/SamuiUtils';

function DataTable({ masterList, detailList, statusColours, name, onPageInsert, onRowSelected }) {
    const [dataMasterList, setDataMasterList] = useState([]);
    const [dataDetailList, setDataDetailList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    // StatusColours
    const [countNewRec, setCountNewRec] = useState(0);
    const [countInStock, setCountInStock] = useState(0);
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
                    'ใบใหม่': 0,
                    'รับเข้าสต๊อคแล้ว': 0,
                    'ยกเลิก': 0
                };

                masterList.forEach(data => {
                    if (data.RecStatus_Name) {
                        statusCounts[data.RecStatus_Name] = (statusCounts[data.RecStatus_Name] || 0) + 1;
                    }
                });

                setCountNewRec(statusCounts['ใบใหม่']);
                setCountInStock(statusCounts['รับเข้าสต๊อคแล้ว']);
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

    // สามารถใช้กรองคำที่จะไม่ใช้ใน Counter Box ได้
    // const filteredStatusColours = statusColours.filter(statusObj =>
    //     !['รออนุมัติ', 'ไม่อนุมัติ'].includes(statusObj.DocSetStaus_Name)
    // );

    return (
        <>
            <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={name} items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/product-receipt' },
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
                    {/* <center>
                        <b>สถานะเอกสาร</b>
                    </center>
                    <br /> */}
                    {statusColours.map((statusObj, index) => {
                        const { DocSetStaus_Name, DocSetColour } = statusObj;
                        let count;

                        switch (DocSetStaus_Name) {
                            case 'ใบใหม่':
                                count = countNewRec;
                                break;
                            case 'รับเข้าสต๊อคแล้ว':
                                count = countInStock;
                                break;
                            case 'ยกเลิก':
                                count = countCancel;
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
                <div className="col-11">
                    <div className="card">
                        <div className="table-responsive">
                            <table id="basic-datatables" className="table table-striped table-hover">
                                <thead className="thead-dark">
                                    {/* การตั้งให้ล็อกหัวตาราง */}
                                    {/* <tr className={window.innerWidth >= 1024 || window.innerWidth <= 2000 ? 'fixed-header' : ''}> */}
                                    <tr>
                                        <th className="text-center" style={{ width: '4%' }}>เลขที่เอกสาร</th>
                                        <th className="text-center" style={{ width: '7%' }}>ประเภทเอกสาร</th>
                                        <th className="text-center" style={{ width: '13%' }}>สถานะ</th>
                                        <th className="text-center" style={{ width: '4%' }}>วันที่เอกสาร</th>
                                        <th className="text-center" style={{ width: '7%' }}>รหัสเจ้าหนี้</th>
                                        <th className="text-center" style={{ width: '26%' }}>ชื่อเจ้าหนี้</th>
                                        <th className="text-center" style={{ width: '4%' }}>Due Date</th>
                                        <th className="text-center" style={{ width: '8%' }}>ยอดรวม</th>
                                        <th className="text-center" style={{ width: '8%' }}>สร้างรายการ โดย</th>
                                        <th className="text-center" style={{ width: '8%' }}>แก้ไขล่าสุด โดย</th>
                                    </tr>
                                </thead>
                                {/* <div className="extra-spacing">
                                    <br /><br /><br /><br />
                                </div> */}
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((data, index) => (
                                            <tr onClick={() => onRowSelected(data.Rec_No)}
                                                key={data.Rec_No || index + 1} style={{ cursor: 'pointer' }}>
                                                <td className="text-left">{data.Rec_No || "-"}</td>
                                                <td className="text-center">{data.DocType_Name || "-"}</td>
                                                <td className="text-left">
                                                    {data.RecStatus_Name ? (
                                                        <button
                                                            className="btn"
                                                            style={{
                                                                backgroundColor: data.RecStatus_Colour,
                                                                color: 'white',
                                                                width: '100%'
                                                            }}
                                                        >
                                                            {data.RecStatus_Name}
                                                        </button>
                                                    ) : (
                                                        <center>
                                                            <p>-</p>
                                                        </center>
                                                    )}
                                                </td>
                                                <td className="text-left">{data.Rec_Date ? formatDate(data.Rec_Date) : "-"}</td>
                                                <td className="text-left">{data.AP_Code || "-"}</td>
                                                <td className="text-left">{data.AP_Name || "-"}</td>
                                                <td className="text-left">{data.Doc_DueDate ? formatDate(data.Doc_DueDate) : "-"}</td>
                                                <td className="text-end">
                                                    {formatCurrency(data.NetTotal)}
                                                </td>
                                                <td className="text-center">{data.Created_By_Name || "-"}</td>
                                                <td className="text-center">{data.Update_By_Name || "-"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10">
                                                <center>
                                                    <h5>ไม่พบข้อมูล</h5>
                                                </center>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="row mt-3">
                            <div className="col-12 d-flex justify-content-end">
                                <div className="dataTables_paginate paging_simple_numbers" id="basic-datatables_paginate">
                                    <ul className="pagination">
                                        <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <a href="#" className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</a>
                                        </li>
                                        {renderPageNumbers()}
                                        <li className={`paginate_button page-item next ${currentPage === Math.ceil(dataMasterList.length / itemsPerPage) ? 'disabled' : ''}`}>
                                            <a href="#" className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DataTable;
import React from 'react';

// CSS
import './../../../assets/css/purchase/datatable.css';

// Utils
import { formatCurrency, formatDate } from '../../../utils/SamuiUtils';

const DataTable = ({ currentItems, onRowSelected, currentPage, handlePageChange, dataMasterList, itemsPerPage, fieldMappings }) => {
    const renderPageNumbers = () => {
        const totalPages = Math.ceil(dataMasterList.length / itemsPerPage);
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`paginate_button page-item ${currentPage === i ? 'active' : ''}`}>
                    <a href="#" className="page-link" onClick={() => handlePageChange(i)}>{i}</a>
                </li>
            );
        }
        return pages;
    };

    return (
        <div className="col-11">
            <div className="card">
                <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table id="basic-datatables" className="table table-striped table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th className="text-center" style={{ width: '5%' }}>เลขที่เอกสาร</th>
                                <th className="text-center" style={{ width: '8%' }}>ประเภทเอกสาร</th>
                                <th className="text-center" style={{ width: '10%' }}>สถานะเอกสาร</th>

                                <th hidden={window.location.pathname === '/purchase-order' ? false : true}
                                    className="text-center"
                                    style={{ width: '10%' }}>
                                    สถานะรับสินค้า
                                </th>

                                <th className="text-center" style={{ width: '6%' }}>วันที่เอกสาร</th>
                                <th className="text-center" style={{ width: '6%' }}>รหัสเจ้าหนี้</th>
                                <th className="text-center" style={window.location.pathname === '/purchase-order'
                                    ? { width: '25%' } : { width: '35%' }}>ชื่อเจ้าหนี้</th>
                                <th className="text-center" style={{ width: '6%' }}>Due Date</th>
                                <th className="text-center" style={{ width: '8%' }}>ยอดรวม</th>
                                <th className="text-center" style={{ width: '8%' }}>สร้างรายการ โดย</th>
                                <th className="text-center" style={{ width: '8%' }}>แก้ไขล่าสุด โดย</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((data, index) => (
                                    <tr onClick={() => onRowSelected(data[fieldMappings.no])}
                                        key={data[fieldMappings.no] || index + 1} style={{ cursor: 'pointer' }}>
                                        <td className="text-left">{data[fieldMappings.no] || "-"}</td>
                                        <td className="text-center">{data[fieldMappings.typeName] || "-"}</td>
                                        <td className="text-left">
                                            {data[fieldMappings.statusName] ? (
                                                <button
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: data[fieldMappings.statusColor],
                                                        color: 'white',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {data[fieldMappings.statusName]}
                                                </button>
                                            ) : (
                                                <center>
                                                    <p>-</p>
                                                </center>
                                            )}
                                        </td>
                                        <td className="text-left" hidden={window.location.pathname === '/purchase-order' ? false : true}>
                                            {data[fieldMappings.statusName] ? (
                                                <button
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: data[fieldMappings.statusReceiveColor],
                                                        color: 'white',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {data[fieldMappings.statusReceiveName]}
                                                </button>
                                            ) : (
                                                <center>
                                                    <p>-</p>
                                                </center>
                                            )}
                                        </td>
                                        <td className="text-center">{data[fieldMappings.date] ? formatDate(data[fieldMappings.date]) : "-"}</td>
                                        <td className="text-center">{data[fieldMappings.apCode] || "-"}</td>
                                        <td className="text-left">{data[fieldMappings.apName] || "-"}</td>
                                        <td className="text-center">{data[fieldMappings.dueDate] ? formatDate(data[fieldMappings.dueDate]) : "-"}</td>
                                        <td className="text-end">
                                            {formatCurrency(data[fieldMappings.netTotal] || 0.00)}
                                        </td>
                                        <td className="text-center">{data[fieldMappings.createdBy] || "-"}</td>
                                        <td className="text-center">{data[fieldMappings.updatedBy] || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={window.location.pathname === '/purchase-order' ? "11" : "10"}>
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
    );
};

export default DataTable;
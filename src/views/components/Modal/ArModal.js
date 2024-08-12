import React, { useState, useEffect } from 'react';

// Utils
// import { formatCurrency } from '../../../utils/SamuiUtils';

const ArModal = ({ showArModal, handleArClose, arDataList, onRowSelectAr }) => {
    // สถานะการค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArDataList, setFilteredArDataList] = useState(arDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ arDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredArDataList(
            arDataList.filter(ar =>
                ar.AR_Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ar.AR_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, arDataList]);

    useEffect(() => {
        if (showArModal) {
            setSearchTerm('');
        }
    }, [showArModal]);

    return (
        <>
            <div className={`modal ${showArModal ? 'show' : ''}`} style={{ display: showArModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อลูกค้า</h5>
                            <button type="button" className="close" onClick={handleArClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา AR_CODE หรือ AR_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '650px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '139px' }}>AR_CODE</th>
                                            <th className="text-center" style={{ width: '620px' }}>AR_NAME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredArDataList && filteredArDataList.length > 0 ? (
                                            filteredArDataList.map((ar, index) => (
                                                <tr
                                                    key={ar.AR_Id || index + 1}
                                                    onClick={() => onRowSelectAr(ar)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">{ar.AR_Code}</td>
                                                    <td>{ar.AR_Name}</td>
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
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleArClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Overlay */}
            {showArModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default ArModal;

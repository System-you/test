import React, { useState, useEffect } from 'react';

// Utils
// import { formatCurrency } from '../../../utils/SamuiUtils';

const ApModal = ({ showApModal, handleApClose, apDataList, onRowSelectAp }) => {
    // สถานะการค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredApDataList, setFilteredApDataList] = useState(apDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ apDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredApDataList(
            apDataList.filter(ap =>
                ap.AP_Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ap.AP_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, apDataList]);

    useEffect(() => {
        if (showApModal) {
            setSearchTerm('');
        }
    }, [showApModal]);

    return (
        <>
            <div className={`modal ${showApModal ? 'show' : ''}`} style={{ display: showApModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อผู้ขาย</h5>
                            <button type="button" className="close" onClick={handleApClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา AP_CODE หรือ AP_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '650px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '139px' }}>AP_CODE</th>
                                            <th className="text-center" style={{ width: '620px' }}>AP_NAME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApDataList && filteredApDataList.length > 0 ? (
                                            filteredApDataList.map((ap, index) => (
                                                <tr
                                                    key={ap.AP_Id || index + 1}
                                                    onClick={() => onRowSelectAp(ap)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">{ap.AP_Code}</td>
                                                    <td>{ap.AP_Name}</td>
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
                            <button className="btn btn-secondary" onClick={handleApClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Overlay */}
            {showApModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default ApModal;

import React, { useState, useEffect } from 'react';

// Utils
import { formatCurrency } from '../../../utils/SamuiUtils';

const PrModal = ({ showPrModal, handlePrClose, prDataList, onRowSelectPr }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPrDataList, setFilteredPrDataList] = useState(prDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ prDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredPrDataList(
            prDataList.filter(pr =>
                pr.Doc_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pr.AP_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, prDataList]);

    useEffect(() => {
        if (showPrModal) {
            setSearchTerm('');
        }
    }, [showPrModal]);

    return (
        <>
            {/* Modal */}
            <div className={`modal ${showPrModal ? 'show' : ''}`} style={{ display: showPrModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อใบขอซื้อ</h5>
                            <button type="button" className="close" onClick={handlePrClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหาเลขที่เอกสาร (PR) หรือ AP_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '15%' }}>เลขที่เอกสาร (PR)</th>
                                            <th className="text-center" style={{ width: '40%' }}>AP_NAME</th>
                                            <th className="text-center" style={{ width: '35%' }}>รายละเอียดเอกสาร</th>
                                            <th className="text-center" style={{ width: '10%' }}>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPrDataList && filteredPrDataList.length > 0 ? (
                                            filteredPrDataList.map((pr, index) => (
                                                <tr key={pr.Doc_Id || index + 1}
                                                    onClick={() => onRowSelectPr(pr)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">{pr.Doc_No}</td>
                                                    <td className="text-left">{pr.AP_Name}</td>
                                                    <td className="text-left">{pr.Doc_Remark1}</td>
                                                    <td className="text-end">{formatCurrency(pr.NetTotal)}</td>
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
                            <button className="btn btn-secondary" onClick={handlePrClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showPrModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default PrModal;
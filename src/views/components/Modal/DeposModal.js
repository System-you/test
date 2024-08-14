import React, { useState, useEffect } from 'react';

// Utils
import { formatCurrency } from '../../../utils/SamuiUtils';

const DeposModal = ({ showDeposModal, handleDeposClose, deposDataList, onRowSelectDepos }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDeposDataList, setFilteredDeposDataList] = useState(deposDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ deposDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredDeposDataList(
            deposDataList.filter(depos =>
                depos.Doc_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
                depos.AR_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, deposDataList]);

    useEffect(() => {
        if (showDeposModal) {
            setSearchTerm('');
        }
    }, [showDeposModal]);

    return (
        <>
            {/* Modal */}
            <div className={`modal ${showDeposModal ? 'show' : ''}`} style={{ display: showDeposModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อใบมัดจำ</h5>
                            <button type="button" className="close" onClick={handleDeposClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหาเลขที่เอกสาร (DEPOS) หรือ ชื่อลูกค้า"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '15%' }}>เลขที่เอกสาร (DEPOS)</th>
                                            <th className="text-center" style={{ width: '40%' }}>AR_NAME</th>
                                            <th className="text-center" style={{ width: '35%' }}>รายละเอียดเอกสาร</th>
                                            <th className="text-center" style={{ width: '10%' }}>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDeposDataList && filteredDeposDataList.length > 0 ? (
                                            filteredDeposDataList.map((depos, index) => (
                                                <tr
                                                    key={depos.Doc_Id || index + 1}
                                                    onClick={() => onRowSelectDepos(depos)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">{depos.Doc_No}</td>
                                                    <td className="text-left">{depos.AR_Name}</td>
                                                    <td className="text-left">{depos.Doc_Remark1}</td>
                                                    <td className="text-end">{formatCurrency(depos.NetTotal)}</td>
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
                            <button className="btn btn-secondary" onClick={handleDeposClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showDeposModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default DeposModal;
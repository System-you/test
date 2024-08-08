import React, { useState, useEffect } from 'react';

// Utils
import { formatCurrency } from '../../../utils/SamuiUtils';

const PoModal = ({ showPoModal, handlePoClose, poDataList, onRowSelectPo }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPoDataList, setFilteredPoDataList] = useState(poDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ poDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredPoDataList(
            poDataList.filter(po =>
                po.Doc_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.AP_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, poDataList]);

    useEffect(() => {
        if (showPoModal) {
            setSearchTerm('');
        }
    }, [showPoModal]);

    return (
        <>
            {/* Modal */}
            <div className={`modal ${showPoModal ? 'show' : ''}`} style={{ display: showPoModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อใบสั่งซื้อ</h5>
                            <button type="button" className="close" onClick={handlePoClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหาเลขที่เอกสาร (PO) หรือ AP_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '15%' }}>เลขที่เอกสาร (PO)</th>
                                            <th className="text-center" style={{ width: '40%' }}>AP_NAME</th>
                                            <th className="text-center" style={{ width: '35%' }}>รายละเอียดเอกสาร</th>
                                            <th className="text-center" style={{ width: '10%' }}>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPoDataList && filteredPoDataList.length > 0 ? (
                                            filteredPoDataList.map((po, index) => (
                                                <tr
                                                    key={po.Doc_Id || index + 1}
                                                    onClick={() => onRowSelectPo(po)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">{po.Doc_No}</td>
                                                    <td className="text-left">{po.AP_Name}</td>
                                                    <td className="text-left">{po.Doc_Remark1}</td>
                                                    <td className="text-end">{formatCurrency(po.NetTotal)}</td>
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
                            <button className="btn btn-secondary" onClick={handlePoClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showPoModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default PoModal;
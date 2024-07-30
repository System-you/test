import React, { useState, useEffect } from 'react';
import { formatCurrency, getAlert } from '../../../utils/SamuiUtils';

const RecModal = ({ showRecModal, handleRecClose, recDataList, onRowSelectRec, onConfirmRecSelection }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecDataList, setFilteredRecDataList] = useState(recDataList);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        setFilteredRecDataList(
            recDataList.filter(rec =>
                rec.Rec_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rec.AP_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, recDataList]);

    useEffect(() => {
        if (showRecModal) {
            setSearchTerm('');
            setSelectedItems([]);
        }
    }, [showRecModal]);

    const checkApNameConsistency = (items) => {
        if (items.length > 0) {
            const apName = items[0].AP_Name;
            const isConsistent = items.every(item => item.AP_Name === apName);
            if (!isConsistent) {
                getAlert('FAILED', 'กรุณาเลือกผู้รับเงินเป็นรายเดียวกัน');
            }
            return isConsistent;
        }
        return true;
    };

    const handleCheckboxChange = (rec) => {
        let updatedSelectedItems;
        if (selectedItems.some(item => item.Rec_No === rec.Rec_No)) {
            updatedSelectedItems = selectedItems.filter(item => item.Rec_No !== rec.Rec_No);
        } else {
            updatedSelectedItems = [...selectedItems, rec];
        }

        setSelectedItems(updatedSelectedItems);
    };

    const handleConfirmSelection = () => {
        if (checkApNameConsistency(selectedItems)) {
            onConfirmRecSelection(selectedItems);
        }
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    return (
        <>
            <div className={`modal ${showRecModal ? 'show' : ''}`} style={{ display: showRecModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อใบรับสินค้า</h5>
                            <button type="button" className="close" onClick={handleRecClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหาเลขที่เอกสาร (REC) หรือ AP_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '3%' }}>
                                                <input type="checkbox" onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedItems(checked ? filteredRecDataList : []);
                                                }} checked={filteredRecDataList.length > 0 && selectedItems.length === filteredRecDataList.length} />
                                            </th>
                                            <th className="text-center" style={{ width: '15%' }}>เลขที่เอกสาร (REC)</th>
                                            <th className="text-center" style={{ width: '40%' }}>AP_NAME</th>
                                            <th className="text-center" style={{ width: '32%' }}>รายละเอียดเอกสาร</th>
                                            <th className="text-center" style={{ width: '10%' }}>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecDataList && filteredRecDataList.length > 0 ? (
                                            filteredRecDataList.map((rec, index) => (
                                                <tr
                                                    key={rec.Rec_Id || index + 1}
                                                    checked={selectedItems.some(item => item.Rec_No === rec.Rec_No)}
                                                    onClick={() => handleCheckboxChange(rec)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <td className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.some(item => item.Rec_No === rec.Rec_No)}
                                                            onChange={() => handleCheckboxChange(rec)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td className="text-center">{rec.Rec_No}</td>
                                                    <td className="text-left">{rec.AP_Name}</td>
                                                    <td className="text-left">{rec.Doc_Remark1}</td>
                                                    <td className="text-end">{formatCurrency(rec.NetTotal)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">
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
                            <button className="btn btn-primary" onClick={handleConfirmSelection}>
                                ยืนยันการเลือก
                            </button>
                            <button className="btn btn-danger" onClick={clearSelection}>
                                เริ่มใหม่
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showRecModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default RecModal;
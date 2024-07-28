import React, { useState, useEffect } from 'react';

// Utils
// import { formatCurrency } from '../../../utils/SamuiUtils';

const ItemModal = ({ showItemModal, handleItemClose, itemDataList, onRowSelectItem }) => {
    // สถานะการค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItemDataList, setFilteredItemDataList] = useState(itemDataList);

    // ฟิลเตอร์ข้อมูลเมื่อ searchTerm หรือ itemDataList เปลี่ยนแปลง
    useEffect(() => {
        setFilteredItemDataList(
            itemDataList.filter(item =>
                item.Item_Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Item_Name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, itemDataList]);

    useEffect(() => {
        if (showItemModal) {
            setSearchTerm('');
        }
    }, [showItemModal]);

    return (
        <>
            <div
                className={`modal ${showItemModal ? 'show' : ''}`}
                style={{ display: showItemModal ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
            >
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">รายชื่อสินค้า</h5>
                            <button type="button" className="close" onClick={handleItemClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา ITEM_CODE หรือ ITEM_NAME"
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center" style={{ width: '226px' }}>ITEM_CODE</th>
                                            <th className="text-center" style={{ width: '529px' }}>ITEM_NAME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItemDataList && filteredItemDataList.length > 0 ? (
                                            filteredItemDataList.map((item, index) => (
                                                <tr
                                                    key={item.Item_Id || index + 1}
                                                    onClick={() => onRowSelectItem(item)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="text-center">{item.Item_Code}</td>
                                                    <td className="text-left">{item.Item_Name}</td>
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
                            <button className="btn btn-secondary" onClick={handleItemClose}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showItemModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default ItemModal;
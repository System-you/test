import React from 'react';
import ItemModal from '../Modal/ItemModal';

const ItemTable = ({
    formDetailList,
    handleChangeDetail,
    handleRemoveRow,
    formatCurrency,
    showItemModal,
    handleItemClose,
    itemDataList,
    onRowSelectItem,
    handleItemShow,
    disabled
}) => {

    // ถ้าเป็นหน้าใบสั่งซื้อและใบรับสินค้า ให้แสดง Column จำนวนรับ / จำนวนค้างรับ
    const isPurchaseOrderOrReceipt = () => {
        return window.location.pathname === '/purchase-order' || window.location.pathname === '/purchase-receipt';
    };

    // ถ้าเป็นหน้าใบสั่งซื้อและใบรับสินค้า ให้กำหนด Width จำนวนรับ / จำนวนค้างรับ
    const getColumnWidth = () => {
        if (window.location.pathname === '/purchase-order') {
            return '13%';
        } else if (window.location.pathname === '/purchase-receipt') {
            return '21%';
        } else {
            return '21%';
        }
    };

    return (
        <div className="col-12">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">รายละเอียดสินค้า</h4>
                    <button
                        type="button"
                        className="btn custom-button"
                        onClick={handleItemShow}
                        hidden={disabled}>
                        <i className="fa fa-plus"></i> เพิ่มรายการ
                    </button>
                </div>
                <ItemModal
                    showItemModal={showItemModal}
                    handleItemClose={handleItemClose}
                    itemDataList={itemDataList}
                    onRowSelectItem={onRowSelectItem}
                />
                <div className="card-body">
                    <div className="table-responsive">
                        <table id="basic-datatables" className="table table-striped table-hover">
                            <thead className="thead-dark">
                                <tr>
                                    <th className="text-center" style={{ width: '1%' }}>#</th>
                                    <th className="text-center" style={{ width: '10%' }}>รหัสสินค้า</th>
                                    <th
                                        className="text-center"
                                        style={window.location.pathname === '/purchase-order' ? { width: '12%' } : { width: '20%' }}>
                                        ชื่อสินค้า
                                    </th>
                                    <th className="text-center" style={{ width: '8%' }}>จำนวน</th>
                                    <th hidden={window.location.pathname === '/purchase-order' ? false : true}
                                        className="text-center"
                                        style={{ width: '8%' }}>
                                        จำนวนรับ
                                    </th>
                                    <th hidden={!isPurchaseOrderOrReceipt()}
                                        className="text-center"
                                        style={{ width: '8%' }}>
                                        จำนวนค้างรับ
                                    </th>
                                    <th className="text-center" style={{ width: '6%' }}>หน่วย</th>
                                    <th className="text-center" style={{ width: '8%' }}>ราคาต่อหน่วย</th>
                                    <th className="text-center" style={{ width: '8%' }}>ส่วนลด</th>
                                    <th className="text-center" style={{ width: '5%' }}>%</th>
                                    <th className="text-center" style={{ width: '10%' }}>จำนวนเงินรวม</th>
                                    <th
                                        className="text-center"
                                        style={{ width: getColumnWidth() }}>
                                        คลังสินค้า
                                    </th>
                                    <th className="text-center" style={{ width: '3%' }}>ลบ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formDetailList.map((item, index) => (
                                    <tr key={item.itemId || index + 1}>
                                        {/* # */}
                                        <td className="text-center">{index + 1}</td>

                                        {/* รหัสสินค้า */}
                                        <td className="text-center">
                                            <span>{item.itemCode || ''}</span>
                                        </td>

                                        {/* ชื่อสินค้า */}
                                        <td className="text-center">
                                            <span>{item.itemName || ''}</span>
                                        </td>

                                        {/* จำนวน */}
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                value={item.itemQty || 0}
                                                onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                disabled={window.location.pathname === '/product-receipt'
                                                    ? (!disabled ? true : false) || (item.itemRecBalance === 0 ? true : false)
                                                    : disabled}
                                            />
                                        </td>

                                        {/* จำนวนรับ */}
                                        <td
                                            hidden={window.location.pathname === '/purchase-order' ? false : true}
                                            className="text-center"
                                        >
                                            {disabled ? (
                                                <span>{item.itemRecQty || 0}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control text-center"
                                                    value={item.itemRecQty || 0}
                                                    onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                    disabled={disabled}
                                                />
                                            )}
                                        </td>

                                        {/* จำนวนค้างรับ */}
                                        <td
                                            hidden={!isPurchaseOrderOrReceipt()}
                                            className="text-center">
                                            {disabled ? (
                                                <span>{item.itemRecBalance || 0}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control text-center"
                                                    value={item.itemRecBalance || 0}
                                                    onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                    disabled={disabled}
                                                />
                                            )}
                                        </td>

                                        {/* หน่วย */}
                                        <td className="text-center">
                                            {disabled ? (
                                                <span>{item.itemUnit || ''}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={item.itemUnit || ''}
                                                    disabled={true}
                                                    onChange={(e) => handleChangeDetail(index, 'itemUnit', e.target.value)}
                                                />
                                            )}
                                        </td>

                                        {/* ราคาต่อหน่วย */}
                                        <td className="text-end">
                                            {disabled ? (
                                                <span>{formatCurrency(item.itemPriceUnit || 0)}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control text-end"
                                                    value={item.itemPriceUnit || 0}
                                                    onChange={(e) => handleChangeDetail(index, 'itemPriceUnit', e.target.value)}
                                                    disabled={disabled}
                                                />
                                            )}
                                        </td>

                                        {/* ส่วนลด */}
                                        <td className="text-end">
                                            {disabled ? (
                                                <span>{formatCurrency(item.itemDiscount || 0)}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control text-end"
                                                    value={item.itemDiscount || 0}
                                                    onChange={(e) => handleChangeDetail(index, 'itemDiscount', e.target.value)}
                                                    disabled={disabled}
                                                />
                                            )}
                                        </td>

                                        {/* % */}
                                        <td className="text-center">
                                            {disabled ? (
                                                <span>{item.itemDisType === "1" ? "฿" : item.itemDisType === "2" ? "%" : ""}</span>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    value={item.itemDisType || ''}
                                                    onChange={(e) => handleChangeDetail(index, 'itemDisType', e.target.value)}
                                                    disabled={disabled}
                                                >
                                                    <option value="1">฿</option>
                                                    <option value="2">%</option>
                                                </select>
                                            )}
                                        </td>

                                        {/* จำนวนเงินรวม */}
                                        <td className="text-end">
                                            <span>{formatCurrency(item.itemTotal || 0)}</span>
                                        </td>

                                        {/* คลังสินค้า */}
                                        <td className="text-center">
                                            <span>{item.whName || ''}</span>
                                        </td>

                                        {/* ลบ */}
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => handleRemoveRow(index)}
                                                disabled={disabled}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemTable;
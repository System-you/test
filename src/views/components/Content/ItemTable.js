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
                                    <th className="text-center" style={{ width: '2%' }}>#</th>
                                    <th className="text-center" style={{ width: '10%' }}>รหัสสินค้า</th>
                                    <th className="text-center" style={{ width: '20%' }}>ชื่อสินค้า</th>
                                    <th className="text-center" style={{ width: '8%' }}>จำนวน</th>
                                    <th className="text-center" style={{ width: '6%' }}>หน่วย</th>
                                    <th className="text-center" style={{ width: '8%' }}>ราคาต่อหน่วย</th>
                                    <th className="text-center" style={{ width: '8%' }}>ส่วนลด</th>
                                    <th className="text-center" style={{ width: '5%' }}>%</th>
                                    <th className="text-center" style={{ width: '10%' }}>จำนวนเงินรวม</th>
                                    <th className="text-center" style={{ width: '20%' }}>คลังสินค้า</th>
                                    <th className="text-center" style={{ width: '3%' }}>ลบ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formDetailList.map((item, index) => (
                                    <tr key={item.itemId || index + 1}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                value={item.itemCode || ''}
                                                disabled={true}
                                                onChange={(e) => handleChangeDetail(index, 'itemCode', e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item.itemName || ''}
                                                disabled={true}
                                                onChange={(e) => handleChangeDetail(index, 'itemName', e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                value={item.itemQty || 0}
                                                onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                // disabled={window.location.pathname === '/product-receipt'
                                                //     ? (!disabled ? true : false)
                                                //     : disabled}
                                                disabled={disabled}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item.itemUnit || ''}
                                                disabled={true}
                                                onChange={(e) => handleChangeDetail(index, 'itemUnit', e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="number"
                                                className="form-control text-end"
                                                value={item.itemPriceUnit || 0}
                                                onChange={(e) => handleChangeDetail(index, 'itemPriceUnit', e.target.value)}
                                                disabled={disabled}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="number"
                                                className="form-control text-end"
                                                value={item.itemDiscount || 0}
                                                onChange={(e) => handleChangeDetail(index, 'itemDiscount', e.target.value)}
                                                disabled={disabled}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <select
                                                className="form-select"
                                                value={item.itemDisType || ''}
                                                onChange={(e) => handleChangeDetail(index, 'itemDisType', e.target.value)}
                                                disabled={disabled}
                                            >
                                                <option value="1">฿</option>
                                                <option value="2">%</option>
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control text-end"
                                                value={formatCurrency(item.itemTotal || 0)}
                                                disabled={true}
                                                onChange={(e) => handleChangeDetail(index, 'itemTotal', e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item.whName || ''}
                                                disabled={true}
                                                onChange={(e) => handleChangeDetail(index, 'whId', item.whId)}
                                            />
                                        </td>
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
        // <div className="col-12">
        //     <div className="table100 ver1 m-b-110">
        //         <div className="table100-head">
        //             <table>
        //                 <thead>
        //                     <tr className="row100 head">
        //                         {/* <th className="cell100 column1">Class name</th>
        //                         <th className="cell100 column2">Type</th>
        //                         <th className="cell100 column3">Hours</th>
        //                         <th className="cell100 column4">Trainer</th>
        //                         <th className="cell100 column5">Spots</th> */}

        //                         <th className="cell100">#</th>
        //                         <th className="cell100">รหัสสินค้า</th>
        //                         <th className="cell100">ชื่อสินค้า</th>
        //                         <th className="cell100">จำนวน</th>
        //                         <th className="cell100">หน่วย</th>
        //                         <th className="cell100">ราคาต่อหน่วย</th>
        //                         <th className="cell100">ส่วนลด</th>
        //                         <th className="cell100">%</th>
        //                         <th className="cell100">จำนวนเงินรวม</th>
        //                         <th className="cell100">คลังสินค้า</th>
        //                         <th className="cell100">ลบ</th>
        //                     </tr>
        //                 </thead>
        //             </table>
        //         </div>
        //         <div className="table100-body js-pscroll ps ps--active-y">
        //             <table>
        //                 <tbody>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                     <tr className="row100 body">
        //                         <td className="cell100">1</td>
        //                         <td className="cell100">Like a butterfly</td>
        //                         <td className="cell100">Boxing</td>
        //                         <td className="cell100">9:00 AM - 11:00 AM</td>
        //                         <td className="cell100">Aaron Chapman</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                         <td className="cell100">xxxxxxxxxxx</td>
        //                     </tr>
        //                 </tbody>
        //             </table>
        //         </div>
        //     </div>
        // </div>
    );
};

export default ItemTable;
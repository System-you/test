import React from 'react';

const Summary = ({
    formMasterList,
    handleChangeMaster,
    selectedDiscountValueType,
    handleCheckboxChange,
    receiptDiscount,
    formatCurrency,
    totalPrice,
    subFinal,
    isVatChecked,
    handleVatChange,
    vatAmount,
    grandTotal,
    disabled
}) => {
    return (
        <div className="col-12">
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-4">
                            <div hidden={window.location.pathname === '/payment-voucher'}>
                                <h5>ส่วนลดท้ายบิล</h5>
                                <div className="row mt-3">
                                    <div className="col-3">
                                        <div className="d-flex align-items-center">
                                            <label className="mr-2 flex-grow-1">ส่วนลดมูลค่า</label>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <input
                                            type="number"
                                            className="form-control text-end"
                                            name="discountValue"
                                            value={formMasterList.discountValue || 0}
                                            onChange={handleChangeMaster}
                                            disabled={disabled}
                                        />
                                    </div>
                                    <div className="col-3">
                                        <div className="row">
                                            <div className="radio-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="1"
                                                    checked={selectedDiscountValueType === '1'}
                                                    onChange={handleCheckboxChange}
                                                    disabled={disabled}
                                                />
                                                <label className="form-check-label">฿</label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="2"
                                                    checked={selectedDiscountValueType === '2'}
                                                    onChange={handleCheckboxChange}
                                                    disabled={disabled}
                                                />
                                                <label className="form-check-label">%</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <input
                                            type="text"
                                            className="form-control text-end"
                                            name="discountValueTotal"
                                            value={receiptDiscount || ''}
                                            onChange={handleChangeMaster}
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div hidden={window.location.pathname === '/payment-voucher'}>
                                <h5>Credit Term</h5>
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div className="row">
                                            <div className="col-2">
                                                <div className="d-flex align-items-center mb-2">
                                                    <label className="mr-2 flex-grow-1">ระบุวัน</label>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="d-flex align-items-center mb-2">
                                                    <input
                                                        type="number"
                                                        className="form-control text-center input-spacing mr-2"
                                                        name="creditTerm"
                                                        value={formMasterList.creditTerm || 0}
                                                        onChange={handleChangeMaster}
                                                        disabled={disabled}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div hidden={false}>
                                <h5>ยอดท้ายบิล</h5>
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-end align-items-center mt-1">
                                            <label>รวมราคา</label>
                                            <input
                                                type="text"
                                                className="form-control text-end input-spacing"
                                                style={{ width: '100px' }}
                                                value={formatCurrency(totalPrice || 0)}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end align-items-center mt-1">
                                            <label>รวมส่วนลด</label>
                                            <input
                                                type="text"
                                                className="form-control text-end input-spacing"
                                                style={{ width: '100px' }}
                                                value={formatCurrency(receiptDiscount || 0)}
                                                disabled={true}
                                            />
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-end align-items-center mt-1">
                                            <label>ราคาหลังหักส่วนลด</label>
                                            <input
                                                type="text"
                                                className="form-control text-end input-spacing"
                                                style={{ width: '100px' }}
                                                value={formatCurrency(subFinal || 0)}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end align-items-center mt-1">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={isVatChecked}
                                                onChange={handleVatChange}
                                                disabled={disabled}
                                            />
                                            <label className="mr-2">VAT (7%)</label>
                                            <input
                                                type="text"
                                                className="form-control text-end input-spacing"
                                                style={{ width: '100px' }}
                                                value={formatCurrency(vatAmount || 0)}
                                                disabled={true}
                                            />
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-end align-items-center mt-1">
                                            <label><h5>รวมทั้งสิ้น</h5></label>
                                            <input
                                                type="text"
                                                className="form-control text-end input-spacing"
                                                style={{ width: '100px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}
                                                value={formatCurrency(grandTotal || 0)}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summary;
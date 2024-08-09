import React, { useState } from 'react';

const FormAction = ({ onSubmit, onUpdate, onCancel, onRecover, onClosePo, docStatus, mode, disabled }) => {
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState(null);

    const handleShowModal = (action) => {
        setAction(action);
        setShowModal(true);
    };

    const handleConfirm = () => {
        if (action === 'submit') onSubmit();
        if (action === 'update') onUpdate();
        if (action === 'recover') onRecover();
        if (action === 'cancel') onCancel();
        if (action === 'closePo') onClosePo();
        setShowModal(false);
    };

    const getActionText = () => {
        switch (action) {
            case 'submit':
                return 'บันทึกข้อมูล';
            case 'update':
                return 'แก้ไขข้อมูล';
            case 'recover':
                return 'ยกเลิกปิดงาน PO';
            case 'cancel':
                return 'ยกเลิกข้อมูล';
            case 'closePo':
                return 'ปิดใบ PO ';
            default:
                return '';
        }
    };

    return (
        <div>
            <div className="row mt-2">
                <div className="col-6">
                    <button
                        onClick={() => handleShowModal('closePo')}
                        type="button"
                        hidden={mode === 'I' || docStatus !== 2}
                        className="btn btn-lg w-30 shadow text-white"
                        style={{ marginLeft: '20px', backgroundColor: 'red', fontSize: '16px' }}
                        disabled={docStatus !== 2}
                    >
                        ปิดงานใบ PO
                    </button>
                </div>
                <div className="col-6 text-end">
                    <button
                        onClick={() => handleShowModal('submit')}
                        type="button"
                        hidden={mode === 'U'}
                        className="btn btn-lg w-25 shadow text-white"
                        style={{ backgroundColor: '#EF6C00', fontSize: '16px' }}
                        disabled={false}
                    >
                        บันทึก
                    </button>
                    <button
                        onClick={() => handleShowModal('recover')}
                        type="button"
                        hidden={mode === 'I' || docStatus !== 4}
                        className="btn btn-lg w-25 shadow text-white"
                        style={{ backgroundColor: 'green', fontSize: '16px' }}
                        disabled={docStatus !== 4}
                    >
                        ยกเลิกปิดงาน PO
                    </button>
                    <button
                        onClick={() => handleShowModal('update')}
                        type="button"
                        hidden={mode === 'I' || docStatus === 4}
                        className="btn btn-lg w-25 shadow text-white"
                        style={{ backgroundColor: '#EF6C00', fontSize: '16px' }}
                        disabled={disabled}
                    >
                        แก้ไข
                    </button>
                    <button
                        onClick={() => handleShowModal('cancel')}
                        type="button"
                        hidden={mode !== 'U'}
                        className="btn btn-lg w-25 shadow text-white"
                        style={{ marginLeft: '20px', backgroundColor: '#808080', fontSize: '16px' }}
                        disabled={disabled}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        type="button"
                        className="btn btn-lg w-25 shadow text-white"
                        style={{ marginLeft: '20px', backgroundColor: 'black', fontSize: '16px' }}
                    >
                        กลับหน้าค้นหา
                    </button>
                </div>
            </div>

            {/* Modal */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">ยืนยันการ{getActionText()}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>คุณแน่ใจว่าต้องการดำเนินการ{getActionText()}หรือไม่?</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-lg w-25 shadow text-white"
                                style={{ backgroundColor: '#EF6C00', fontSize: '16px' }}
                                onClick={handleConfirm}>
                                ยืนยัน
                            </button>
                            <button
                                type="button"
                                className="btn btn-lg w-25 shadow text-white"
                                style={{ backgroundColor: 'red', fontSize: '16px' }}
                                onClick={() => setShowModal(false)}>
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormAction;
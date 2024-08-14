import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { formatDateTime, getAllData, getAlert } from '../../../utils/SamuiUtils';

const WhModal = ({ showWhModal, handleWhClose, itemDetailModal }) => {
    const [formData, setFormData] = useState({
        itemCode: '',
        itemName: '',
        stcBalance: '',
        whName: '',
        quantity: '',
        zone: '',
        location: '',
        reason: '',
        updateType: ''
    });

    const [disabled, setDisabled] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (itemDetailModal) {
            setFormData({
                itemCode: itemDetailModal.Item_Code || '',
                itemName: itemDetailModal.Item_Name || '',
                stcBalance: itemDetailModal.STC_Balance || '',
                whName: itemDetailModal.WH_Name || '',
            });
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [itemDetailModal]);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRadioChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            updateType: e.target.value,

        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const quantity = parseInt(formData.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
            Swal.fire({
                title: 'ข้อผิดพลาด!',
                text: 'กรุณากรอกจำนวนที่ถูกต้องและมากกว่าศูนย์.',
                icon: 'error',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                }
            });
            return;
        }

        if (!formData.reason || formData.reason.length > 30) {
            Swal.fire({
                title: 'ข้อผิดพลาด!',
                text: 'กรุณากรอกเหตุผลให้ครบถ้วนและไม่เกิน 30 ตัวอักษร.',
                icon: 'error',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                }
            });
            return;
        }

        if (!formData.updateType) {
            Swal.fire({
                title: 'ข้อผิดพลาด!',
                text: 'กรุณาเลือกประเภทการอัปเดต.',
                icon: 'error',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                }
            });
            return;
        }

        // Determine the sign of the quantity based on updateType
        const quantityToSend = formData.updateType === 'ao' ? -parseInt(formData.quantity, 10) : parseInt(formData.quantity, 10);

        // Prepare data for API request
        const payload = {
            last_qty: quantityToSend,
            item_onhand: parseInt(formData.stcBalance, 10) + quantityToSend,
            last_stc_seq: formatDateTime(new Date()),
            last_stc_date: null,
            item_id: itemDetailModal?.Item_Id,
            wh_id: itemDetailModal?.WH_Id,
            item_code: itemDetailModal?.Item_Code,
            doc_type: formData.updateType === 'ai' ? 'IN' : 'OUT',
            ref_balance: itemDetailModal?.Ref_Balance,
            stc_qty: quantityToSend,
            stc_balance: parseInt(formData.stcBalance, 10) + quantityToSend,
            stc_date: new Date(),
            stc_by: itemDetailModal?.STC_By,
            comp_id: itemDetailModal?.Comp_Id,
            doc_id: itemDetailModal?.Doc_Id,
            doc_no: itemDetailModal?.Doc_No,
            doc_noref: itemDetailModal?.Doc_NoRef,
            stc_remark: formData.reason,
            stc_seq: itemDetailModal?.STC_SEQ,
            zone_id: itemDetailModal?.Zone_Id,
            lt_id: itemDetailModal?.LT_Id,
            item_code: itemDetailModal?.Item_Code,
            item_name: itemDetailModal?.Item_Name,
        };

        try {
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/wh-item-onhand`, payload, {
                headers: { key: `${process.env.REACT_APP_ANALYTICS_KEY}` }
            });

            Swal.fire({
                title: 'สำเร็จ!',
                text: 'อัปเดตคลังสินค้าสำเร็จ.',
                icon: 'success',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-primary'
                }
            });

            handleWhClose();
            navigate('/warehouse-stock');
        } catch (error) {
            Swal.fire({
                title: 'ข้อผิดพลาด!',
                text: 'ไม่สามารถอัปเดตคลังสินค้าได้.',
                icon: 'error',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                }
            });
        }
    };


    return (
        <>
            <div
                className={`modal ${showWhModal ? 'show' : ''}`}
                style={{ display: showWhModal ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
            >
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">ปรับปรุงคลัง</h5>
                            <button type="button" className="btn-close" onClick={handleWhClose}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {/* Form fields */}
                                <div className="form-group row">
                                    <label htmlFor="itemCode" className="col-sm-1 col-form-label"><strong>รหัสสินค้า</strong></label>
                                    <div className="col-sm-5">
                                        <input
                                            type="text"
                                            id="itemCode"
                                            className="form-control"
                                            value={formData.itemCode}
                                            style={{ fontWeight: 'bold' }}

                                            onChange={handleChange}
                                            disabled={true}

                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="itemName" className="col-sm-1 col-form-label"><strong>ชื่อสินค้า</strong></label>
                                    <div className="col-sm-9">
                                        <input
                                            type="text"
                                            id="itemName"
                                            className="form-control"
                                            value={formData.itemName}
                                            onChange={handleChange}
                                            disabled={true}
                                            style={{ fontWeight: 'bold' }}

                                        />
                                    </div>
                                </div>
                                <div className="container">
                                    <div className="row">
                                        <h5>ปรับปรุงสินค้า เข้า-ออก</h5>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-9 mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <label><strong>คงคลัง : </strong> </label>
                                                        <input
                                                            type="text"
                                                            id="stcBalance"
                                                            className="form-control"
                                                            value={formData.stcBalance}
                                                            onChange={handleChange}
                                                            disabled={true}
                                                            style={{ fontWeight: 'bold' }}


                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-9">
                                                    <div className="d-flex align-items-center">
                                                        <label>จน.ปรับปรุง : </label>
                                                        <input
                                                            type="text"
                                                            id="quantity"
                                                            className="form-control"
                                                            value={formData.quantity}
                                                            onChange={handleChange}
                                                            disabled={disabled}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-10 mb-2">
                                                    <small className="text-danger mb-1">ต้นทาง</small>
                                                    <div className="d-flex align-items-center">
                                                        <label className="me-1">คลัง : </label>
                                                        <select className="form-select" aria-label="Default select example">
                                                            <option selected>ไม่ระบุ</option>
                                                            <option value="1">2023</option>
                                                            <option value="2">2022</option>
                                                            <option value="3">2021</option>
                                                        </select>

                                                    </div>
                                                </div>
                                                <div className="col-10 mb-2">
                                                    <small className="text-danger mb-1">ปลายทาง</small>
                                                    <div className="d-flex align-items-center">
                                                        <label className="me-1">คลัง : </label>
                                                        <select className="form-select" aria-label="Default select example">
                                                            <option selected>ไม่ระบุ</option>
                                                            <option value="1">2023</option>
                                                            <option value="2">2022</option>
                                                            <option value="3">2021</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-12 mb-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="updateType"
                                                            id="option1"
                                                            value="ai"
                                                            checked={formData.updateType === 'ai'}
                                                            onChange={handleRadioChange}
                                                            disabled={disabled}
                                                        />
                                                        <label className="form-check-label" htmlFor="option1">
                                                            ปรับปรุงเข้า (AI)
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="updateType"
                                                            id="option2"
                                                            value="ao"
                                                            checked={formData.updateType === 'ao'}
                                                            onChange={handleRadioChange}
                                                            disabled={disabled}
                                                        />
                                                        <label className="form-check-label" htmlFor="option2">
                                                            ปรับปรุงออก (AO)
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="updateType"
                                                            id="option3"
                                                            value="ย้ายคลัง (TR)"
                                                            checked={formData.updateType === 'ย้ายคลัง (TR)'}
                                                            onChange={handleRadioChange}
                                                            disabled={disabled}
                                                        />
                                                        <label className="form-check-label" htmlFor="option3">
                                                            ย้ายคลัง (TR)
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label htmlFor="reason" className="col-1 col-form-label">เหตุผล:</label>
                                        <div className="col-9">
                                            <input
                                                type="text"
                                                id="reason"
                                                className="form-control"
                                                value={formData.reason}
                                                onChange={handleChange}
                                                disabled={disabled}
                                            />
                                            <small className="text-danger mb-1 mt-2">(30 ตัวอักษร)</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit"
                                        className="btn  btn-lg text-white"
                                        style={{ backgroundColor: 'rgb(239, 108, 0)' }} disabled={disabled}>ยืนยันการปรับปรุง</button>
                                    <button type="button"
                                        className="btn btn-lg text-white"
                                        style={{ backgroundColor: 'black' }} onClick={handleWhClose}>ยกเลิกการปรับปรุง</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showWhModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default WhModal;

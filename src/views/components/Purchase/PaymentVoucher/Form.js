import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// React DateTime
import Datetime from 'react-datetime';
import moment from 'moment';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import RecModal from '../../Modal/RecModal';
import ApModal from '../../Modal/ApModal';
import ItemModal from '../../Modal/ItemModal';
import DeposModal from '../../Modal/DeposModal';
import FormAction from '../../Actions/FormAction';

// Model
import { payMasterModel } from '../../../../model/Purchase/PayMasterModel';
import { payDetailModel } from '../../../../model/Purchase/PayDetailModel';

// Utils
import {
    getAllData,
    getByDocId,
    getByRecId,
    getByPayId,
    getDocType,
    getTransType,
    getViewAp,
    getViewItem,
    getAlert,
    formatCurrency,
    parseCurrency,
    formatStringDateToDate,
    formatDateOnChange,
    formatDateTime,
    formatThaiDateUi,
    formatThaiDateUiToDate,
    getMaxPayNo,
    getCreateDateTime,
    setCreateDateTime
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxPayNo }) {
    const [formMasterList, setFormMasterList] = useState([payMasterModel()]);
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [recDataList, setRecDataList] = useState([]);
    const [apDataList, setApDataList] = useState([]);
    const [arDataList, setArDataList] = useState([]);
    const [itemDataList, setItemDataList] = useState([]);
    const [whDataList, setWhDataList] = useState([]);
    const [deposDataList, setDeposDataList] = useState([]);

    // การคำนวณเงิน
    const [selectedDiscountValueType, setSelectedDiscountValueType] = useState("2");
    const [totalPrice, setTotalPrice] = useState(0);
    const [receiptDiscount, setReceiptDiscount] = useState(0);
    const [subFinal, setSubFinal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [isVatChecked, setIsVatChecked] = useState(false);
    const [vatAmount, setVatAmount] = useState(0);

    // การแสดงสถานะใบ
    const [statusName, setStatusName] = useState("");
    const [statusColour, setStatusColour] = useState("");

    // ใช้สำหรับการ Rendered Form ต่างๆ
    const [docRefType, setDocRefType] = useState("1");

    // ใช้สำหรับการทำเรื่องจ่ายเป็นงวด
    const [paymentStatus, setPaymentStatus] = useState('oneTime'); // สถานะการจ่าย (จ่ายครั้งเดียว หรือ จ่ายเป็นงวด)
    const [installmentCount, setInstallmentCount] = useState(1); // จำนวนงวด

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            const docTypeList = await getDocType();
            if (docTypeList && docTypeList.length > 0) {
                setTbDocType(docTypeList);
            }

            const transTypeList = await getTransType();
            if (transTypeList && transTypeList.length > 0) {
                setTbTransType(transTypeList);
            }

            const recDataList = await getAllData("API_0301_REC_H", "ORDER BY Rec_No DESC");
            if (recDataList && recDataList.length > 0) {
                setRecDataList(recDataList);
            }

            const apDataList = await getViewAp();
            if (apDataList && apDataList.length > 0) {
                setApDataList(apDataList);
            }

            const arDataList = await getAllData('Tb_Set_AR', 'ORDER BY AR_Code ASC');
            if (arDataList && arDataList.length > 0) {
                setArDataList(arDataList);
            }

            const itemDataList = await getViewItem();
            if (itemDataList && itemDataList.length > 0) {
                setItemDataList(itemDataList);
            }

            const whDataList = await getAllData('Tb_Set_WH', 'ORDER BY WH_Code ASC');
            if (whDataList && whDataList.length > 0) {
                setWhDataList(whDataList);
            }

            const deposDataList = await getAllData('API_0501_DEPOS_H', 'ORDER BY Doc_No DESC');
            if (deposDataList && deposDataList.length > 0) {
                setDeposDataList(deposDataList);
            }

            // สำหรับ View เข้ามาเพื่อแก้ไขข้อมูล
            if (mode === 'U') {
                await getModelByNo(apDataList, recDataList);
            }
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const getModelByNo = async (apDataList, recDataList) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับใน AP_ID ใน apDataList
            const findMaster = await getAllData('PAY_H', '');
            const fromDatabase = findMaster.find(rec => rec.Pay_No === maxPayNo);

            if (!fromDatabase) {
                throw new Error("ไม่พบข้อมูลเอกสาร");
            }

            // ค้นหาข้อมูลผู้ขายด้วย AP_ID
            const fromViewAp = apDataList.find(ap => ap.AP_Id === fromDatabase.AP_Id);

            if (!fromViewAp) {
                throw new Error("ไม่พบข้อมูลผู้ขาย");
            }

            // ค้นหาข้อมูล VIEW
            const findViewMaster = await getAllData('API_0401_PAY_H', '');
            const fromView = findViewMaster.find(data => data.Pay_No === maxPayNo);

            if (fromView) {
                setStatusName(fromView.PayStatus_Name);
                setStatusColour(fromView.PayStatus_Colour);
            }

            // SET ข้อมูลตาม PAY_TYPE
            handleChangePayType(String(fromDatabase.Pay_Type));

            // ตั้งค่าข้อมูลเอกสารหลัก
            setFormMasterList([
                {
                    ...mapDatabaseToFormMasterList(fromDatabase),
                    apName: fromViewAp.AP_Name,
                    apAdd1: fromViewAp.AP_Add1,
                    apAdd2: fromViewAp.AP_Add2,
                    apAdd3: fromViewAp.AP_Add3,
                    apProvince: fromViewAp.AP_Province,
                    apZipcode: fromViewAp.AP_Zipcode,
                    apTaxNo: fromViewAp.AP_TaxNo,
                }
            ]);

            // ค้นหาใบที่เชื่อมกับใบแม่
            const fromSubMaster = await getAllData('PAY_H', `AND Ref_DocID = ${fromDatabase.Pay_Id}`);
            if (fromSubMaster.length > 0) {
                setFormMasterList(prevState => [
                    ...prevState,
                    ...fromSubMaster.map(subMaster => mapDatabaseToFormMasterList(subMaster))
                ]);
            }

            // ค้นหาข้อมูลของ Detail ด้วย Doc_ID
            const fromDetail = await getByPayId('PAY_D', fromDatabase.Pay_Id, `ORDER BY Line ASC`);
            if (fromDetail.length > 0) {
                const recSelected = fromDetail.map(detail => recDataList.find(rec => rec.Rec_ID === parseInt(detail.Rec_Id, 10))).filter(Boolean);
                await onRowSelectRec(recSelected);
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${fromDatabase.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    const mapDatabaseToFormMasterList = (database) => ({
        docRefType: database.Pay_Type,
        datePay: formatThaiDateUi(database.Doc_DueDate),
        amountPay: formatCurrency(database.Total_Pay_Per),
        payId: database.Pay_Id,
        payNo: database.Pay_No,
        payDate: formatThaiDateUi(database.Pay_Date || null),
        docDueDate: formatThaiDateUi(database.Doc_DueDate || null),
        payStatus: database.Pay_Status,
        payType: database.Pay_Type,
        refDocID: database.Ref_DocID,
        refDoc: database.Ref_Doc,
        refDocDate: formatThaiDateUi(database.Ref_DocDate),
        compId: database.Comp_Id,
        refProjectID: database.Ref_ProjectID,
        refProjectNo: database.Ref_ProjectNo,
        transportType: database.Transport_Type,
        docRemark1: database.Doc_Remark1,
        docRemark2: database.Doc_Remark2,
        apID: database.AP_ID,
        apCode: database.AP_Code,
        actionHold: database.Action_Hold,
        discountValue: database.Discount_Value,
        discountValueType: database.Discount_Value_Type,
        discountCash: database.Discount_Cash,
        discountCashType: database.Discount_Cash_Type,
        discountTransport: database.Discount_Transport,
        discountTransportType: database.Discount_Transport_Type,
        isVat: database.IsVat,
        docSEQ: database.Doc_SEQ,
        creditTerm: database.CreditTerm,
        creditTerm1Day: database.CreditTerm1Day,
        creditTerm1Remark: database.CreditTerm1Remark,
        creditTerm2Remark: database.CreditTerm2Remark,
        accCode: database.ACC_Code,
        empName: database.EmpName,
        createdDate: setCreateDateTime(database.Created_Date || null),
        createdByName: database.Created_By_Name,
        createdById: database.Created_By_Id,
        updateDate: setCreateDateTime(new Date()),
        updateByName: window.localStorage.getItem('name'),
        updateById: window.localStorage.getItem('emp_id'),
        approvedDate: setCreateDateTime(database.Approved_Date || null),
        approvedByName: database.Approved_By_Name,
        approvedById: database.Approved_By_Id,
        cancelDate: setCreateDateTime(database.Cancel_Date || null),
        cancelByName: database.Cancel_By_Name,
        cancelById: database.Cancel_By_Id,
        approvedMemo: database.Approved_Memo,
        printedStatus: database.Printed_Status,
        printedDate: setCreateDateTime(database.Printed_Date || null),
        printedBy: database.Printed_By,
    });

    const handleSubmit = async () => {
        try {
            // ตรวจสอบค่า formMasterList.apID และ formMasterList.apCode
            if (!formMasterList[0].apID && !formMasterList[0].apCode) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบผู้ขาย");
                return; // หยุดการทำงานของฟังก์ชันหากไม่มีค่า apID หรือ apCode
            }

            // ตรวจสอบว่า formDetailList มีค่าหรือมีความยาวเป็น 0
            if (!formDetailList || formDetailList.length === 0) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบรายละเอียดสินค้า");
                return; // หยุดการทำงานของฟังก์ชันหาก formDetailList ไม่มีค่า
            }

            // หาค่าสูงสุดของ PayNo ใน PAY_H ก่อนบันทึก
            let dateString = formMasterList[0].datePay;
            let givenDate = "PAY" + dateString.substring(6, 10).substring(2) + dateString.substring(3, 5);
            const findMaxPayNo = await getAllData('PAY_H', `AND Pay_No LIKE '${givenDate}%' ORDER BY Pay_No DESC`);
            const maxPay = getMaxPayNo(findMaxPayNo, dateString);
            let newMaxPay = maxPay;

            // เก็บข้อมูลสำหรับใบแรกไว้เสมอ เช่น Ref_DocID, Ref_Doc, Ref_DocDate
            const incrementedPayNo = incrementPayNoWithIndex(newMaxPay, 0);
            let refDocID = null;
            let refDoc = incrementedPayNo;
            let refDocDate = formMasterList[0].payDate || null;

            // บันทึก formMasterList[0] ก่อน
            const formData = {
                pay_no: incrementedPayNo,
                pay_date: formatStringDateToDate(formMasterList[0].payDate),
                doc_due_date: formatStringDateToDate(formMasterList[0].datePay),
                pay_status: parseInt("1", 10),
                pay_type: parseInt(docRefType, 10),
                ref_doc_id: null,
                ref_doc: null,
                ref_doc_date: null,
                comp_id: window.localStorage.getItem('company'),
                ref_project_id: formMasterList[0].refProjectID,
                ref_project_no: formMasterList[0].refProjectNo,
                transport_type: formMasterList[0].transportType,
                doc_remark1: formMasterList[0].docRemark1,
                doc_remark2: formMasterList[0].docRemark2,
                ap_id: parseInt(formMasterList[0].apID, 10),
                ap_code: formMasterList[0].apCode,
                action_hold: parseInt("0", 10),
                discount_value: parseFloat(formMasterList[0].discountValue || 0.00),
                discount_value_type: parseInt(selectedDiscountValueType, 10),
                discount_cash: parseFloat("0.00"),
                discount_cash_type: formMasterList[0].discountCashType,
                discount_transport: parseFloat("0.00"),
                discount_transport_type: formMasterList[0].discountTransportType,
                is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                doc_seq: formatDateTime(new Date()),
                credit_term: parseInt("0", 10),
                credit_term_1_day: parseInt("0", 10),
                credit_term_1_remark: formMasterList[0].creditTerm1Remark,
                credit_term_2_remark: formMasterList[0].creditTerm2Remark,
                acc_code: "0000",
                emp_name: null,
                created_date: formatThaiDateUiToDate(formMasterList[0].createdDate),
                created_by_name: window.localStorage.getItem('name'),
                created_by_id: window.localStorage.getItem('emp_id'),
                update_date: null,
                update_by_name: null,
                update_by_id: null,
                approved_date: null,
                approved_by_name: null,
                approved_by_id: null,
                cancel_date: null,
                cancel_by_name: null,
                cancel_by_id: null,
                approved_memo: null,
                printed_status: "N",
                printed_date: null,
                printed_by: null,
                cancel_memo: null,
                total_pay_per: parseCurrency(formMasterList[0].amountPay)
            };

            const firstResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-h`, formData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            if (firstResponse.data.status !== 'OK') {
                getAlert("FAILED", "ไม่สามารถบันทึกข้อมูลรายการแรกได้");
                return;
            }

            // Fetch ข้อมูลสำหรับ Ref_DocID
            const getPayIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-pay-no`, {
                table: 'PAY_H',
                pay_no: incrementedPayNo
            }, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // เก็บ Pay_Id ของใบแรกเอาไว้ใน refDocID และทำการบันทึก Detail ของใบแรกไปก่อน
            if (getPayIdResponse && getPayIdResponse.data.length > 0) {
                refDocID = getPayIdResponse.data[0].Pay_Id;

                const detailPromises = formDetailList.map((item) => {
                    let payId = parseInt(getPayIdResponse.data[0].Pay_Id, 10);
                    let detailIndex = 1;

                    const formDetailData = {
                        pay_id: payId,
                        rec_dt_id: item.recDtId,
                        rec_id: item.recId,
                        line: detailIndex,
                        item_id: item.itemId,
                        item_code: item.itemCode,
                        item_name: item.itemName,
                        item_qty: item.itemQty,
                        item_unit: item.itemUnit,
                        item_price_unit: parseCurrency(item.itemPriceUnit),
                        item_discount: parseCurrency(item.itemDiscount),
                        item_distype: item.itemDisType === '1' ? parseInt("1", 10) : parseInt("2", 10),
                        item_total: parseCurrency(item.itemTotal),
                        item_status: parseInt("1", 10),
                        wh_id: parseInt(item.whId, 10),
                        zone_id: parseInt("1", 10),
                        lt_id: parseInt("1", 10),
                        ds_seq: formatDateTime(new Date())
                    };

                    detailIndex++;

                    if (parseInt(docRefType, 10) === 3) {
                        handleUpdateDepos(item);
                    }

                    return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-d`, formDetailData, {
                        headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                    });
                });

                await Promise.all(detailPromises);
            } else {
                console.error('ไม่สามารถรับข้อมูล Pay_Id ได้');
                return;
            }

            // *********************************************************************************************
            // ถ้า formMasterList มีมากกว่า 1 ข้อมูล และให้เริ่มต้นบันทึกแต่ข้อมูลที่ [1] เป็นต้นไป
            if (formMasterList.length > 1) {
                for (let i = 1; i < formMasterList.length; i++) {
                    // บันทึก Master
                    let formMasterData = formMasterList[i];

                    // บันทึกข้อมูลของ formMasterData ที่ index i
                    //let incrementedPayNo = incrementPayNoWithIndex(newMaxPay, i);

                    // หาค่าสูงสุดของ PayNo ใน PAY_H ก่อนบันทึก
                    let dateString = formMasterList[i].datePay;
                    console.debug(dateString);
                    let givenDate = "PAY" + dateString.substring(6, 10).substring(2) + dateString.substring(3, 5);
                    const findMaxPayNo = await getAllData('PAY_H', `AND Pay_No LIKE '${givenDate}%' ORDER BY Pay_No DESC`);
                    const maxPay = getMaxPayNo(findMaxPayNo, dateString);
                    let incrementedPayNo = maxPay;

                    // บันทึกรายการที่เหลือใน formMasterList
                    let formData = {
                        pay_no: incrementedPayNo,
                        pay_date: formatStringDateToDate(formMasterData.payDate),
                        doc_due_date: formatStringDateToDate(formMasterData.datePay),
                        pay_status: parseInt("1", 10),
                        pay_type: parseInt(docRefType, 10),
                        ref_doc_id: refDocID,
                        ref_doc: refDoc,
                        ref_doc_date: formatThaiDateUiToDate(refDocDate),
                        comp_id: window.localStorage.getItem('company'),
                        ref_project_id: formMasterData.refProjectID,
                        ref_project_no: formMasterData.refProjectNo,
                        transport_type: formMasterData.transportType,
                        doc_remark1: formMasterData.docRemark1,
                        doc_remark2: formMasterData.docRemark2,
                        ap_id: parseInt(formMasterData.apID, 10),
                        ap_code: formMasterData.apCode,
                        action_hold: parseInt("0", 10),
                        discount_value: parseFloat(formMasterData.discountValue || 0.00),
                        discount_value_type: parseInt(selectedDiscountValueType, 10),
                        discount_cash: parseFloat("0.00"),
                        discount_cash_type: formMasterData.discountCashType,
                        discount_transport: parseFloat("0.00"),
                        discount_transport_type: formMasterData.discountTransportType,
                        is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                        doc_seq: formatDateTime(new Date()),
                        credit_term: parseInt("0", 10),
                        credit_term_1_day: parseInt("0", 10),
                        credit_term_1_remark: formMasterData.creditTerm1Remark,
                        credit_term_2_remark: formMasterData.creditTerm2Remark,
                        acc_code: "0000",
                        emp_name: null,
                        created_date: formatThaiDateUiToDate(formMasterData.createdDate),
                        created_by_name: window.localStorage.getItem('name'),
                        created_by_id: window.localStorage.getItem('emp_id'),
                        update_date: formMasterData.updateDate,
                        update_by_name: formMasterData.updateByName,
                        update_by_id: formMasterData.updateById,
                        approved_date: formMasterData.approvedDate,
                        approved_by_name: formMasterData.approvedByName,
                        approved_by_id: formMasterData.approvedById,
                        cancel_date: formMasterData.cancelDate,
                        cancel_by_name: formMasterData.cancelByName,
                        cancel_by_id: formMasterData.cancelById,
                        approved_memo: formMasterData.approvedMemo,
                        printed_status: "N",
                        printed_date: formMasterData.printedDate,
                        printed_by: formMasterData.printedBy,
                        cancel_memo: formMasterData.cancelMemo,
                        total_pay_per: parseCurrency(formMasterData.amountPay)
                    };

                    let additionalResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-h`, formData, {
                        headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                    });

                    if (additionalResponse.data.status !== 'OK') {
                        getAlert("FAILED", "ไม่สามารถบันทึกรายการที่เหลือได้");
                        return;
                    }

                    let getPayIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-pay-no`, {
                        table: 'PAY_H',
                        pay_no: incrementedPayNo
                    }, {
                        headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                    });

                    if (getPayIdResponse && getPayIdResponse.data.length > 0) {
                        let detailPromises = formDetailList.map((item) => {
                            let payId = parseInt(getPayIdResponse.data[0].Pay_Id, 10);
                            let detailIndex = 1;

                            let formDetailData = {
                                pay_id: payId,
                                rec_dt_id: item.recDtId,
                                rec_id: item.recId,
                                line: detailIndex,
                                item_id: item.itemId,
                                item_code: item.itemCode,
                                item_name: item.itemName,
                                item_qty: item.itemQty,
                                item_unit: item.itemUnit,
                                item_price_unit: parseCurrency(item.itemPriceUnit),
                                item_discount: parseCurrency(item.itemDiscount),
                                item_distype: item.itemDisType === '1' ? parseInt("1", 10) : parseInt("2", 10),
                                item_total: parseCurrency(item.itemTotal),
                                item_status: item.itemStatus,
                                wh_id: parseInt(item.whId, 10),
                                zone_id: parseInt("1", 10),
                                lt_id: parseInt("1", 10),
                                ds_seq: formatDateTime(new Date())
                            };

                            detailIndex++;

                            if (parseInt(docRefType, 10) === 3) {
                                handleUpdateDepos(item);
                            }

                            return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-d`, formDetailData, {
                                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                            });
                        });

                        await Promise.all(detailPromises);
                    }
                }
            }

            // จบกระบวนการทุกอย่างแบบสมบูรณ์
            callInitialize();
            getAlert('OK', 'บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            getAlert("FAILED", "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };

    // ฟังก์ชั่นอัปเดต DEPOSIT ลบรายการออกตามจำนวนที่จ่าย
    const handleUpdateDepos = async (item) => {
        // // => ต้องลบ Item_Qty และ Update Item_Total
        // const deposDetailList = await getByDocId("DEPOS_D", item.docId, `ORDER BY Line ASC`);
        // let deposDetail = deposDetailList.find(depos => depos.Item_Id === item.itemId);

        // // => ให้ปรับจำนวนสินค้าตามที่จ่าย
        // let newItemQty = parseInt(deposDetail.Item_Qty, 10) - parseInt(item.itemQty, 10);

        // // อัพเดทจำนวนที่คำนวณใหม่ (โดยการ Where ด้วย Doc_Id)
        // await updateQty(
        //     'DEPOS_D',
        //     `Item_Qty = ${newItemQty}, Item_Total = ${item.Item_Total}`,
        //     `WHERE Doc_Id = ${item.docId} AND Item_Id = ${item.itemId} AND Item_Status = 1`
        // );

        // // แต่ถ้าจ่ายครบทั้งใบมัดจำแล้ว จะต้องให้ปิดใบมัดจำทันที
        // if (parseInt(item.itemQty, 10) === parseInt(deposDetail.Item_Qty, 10)) {
        // }
    };

    // ฟังก์ชั่นเพิ่มค่า PayNo ด้วย index
    const incrementPayNoWithIndex = (payNo, index) => {
        const prefix = payNo.slice(0, 7); // รวมปีและเดือนใน prefix
        const numPart = parseInt(payNo.slice(7)) + index;
        return prefix + numPart.toString().padStart(4, '0');
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงใน formDetailList
    const handleChangeDetail = (index, field, value) => {
        // ตรวจสอบว่าค่าที่กรอกเข้ามาเป็นตัวเลขเท่านั้น
        if (!/^\d*$/.test(value)) {
            //getAlert("FAILED", "กรุณากรอกเฉพาะตัวเลขเท่านั้น");
            return;
        }

        // แปลงค่าที่กรอกเป็นจำนวนเงิน
        const numericValue = Number(value) || 0;

        const updatedList = [...formDetailList];
        updatedList[index][field] = numericValue;

        const itemQty = Number(updatedList[index].itemQty) || 0;
        const itemPriceUnit = Number(parseCurrency(updatedList[index].itemPriceUnit)) || 0;
        const itemDiscount = Number(parseCurrency(updatedList[index].itemDiscount)) || 0;
        const itemDisType = updatedList[index].itemDisType;

        let itemTotal = itemQty * itemPriceUnit;

        if (itemDisType === 2) {
            itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
        } else {
            itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
        }

        updatedList[index].itemTotal = itemTotal;
        setFormDetailList(updatedList);
    };

    const handleFocusMaster = (index, field) => {
        const updatedList = [...formMasterList];
        // กำหนดค่าเริ่มต้นถ้า field เป็น undefined
        const value = updatedList[index][field] || 0;
        updatedList[index][field] = Number(value.toString().replace(/,/g, ''));
        setFormMasterList(updatedList);
    };

    const handleBlurMaster = (index, field, value) => {
        const numericValue = Number(value.replace(/,/g, '')) || 0;
        const formattedValue = formatCurrency(numericValue);

        const updatedList = [...formMasterList];
        updatedList[index][field] = formattedValue;
        setFormMasterList(updatedList);
    };

    const handleFocusDetail = (index, field) => {
        const updatedList = [...formDetailList];
        // กำหนดค่าเริ่มต้นถ้า field เป็น undefined
        const value = updatedList[index][field] || 0;
        updatedList[index][field] = Number(value.toString().replace(/,/g, ''));
        setFormDetailList(updatedList);
    };

    const handleBlurDetail = (index, field, value) => {
        const numericValue = Number(value.replace(/,/g, '')) || 0;
        const formattedValue = formatCurrency(numericValue);

        const updatedList = [...formDetailList];
        updatedList[index][field] = formattedValue;
        setFormDetailList(updatedList);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงใน formMasterList (action สำหรับตาราง)
    const handleChangeMasterList = (index, field, value) => {
        // ตรวจสอบว่า field เป็น 'amountPay' และค่าที่กรอกเข้ามาเป็นตัวเลขหรือไม่
        if (field === 'amountPay' && !/^\d*$/.test(value)) {
            // แจ้งเตือนหากไม่ใช่ตัวเลข
            // getAlert("FAILED", "กรุณากรอกเฉพาะตัวเลขเท่านั้น");
            return;
        }

        const updatedList = [...formMasterList];
        updatedList[index][field] = value;
        setFormMasterList(updatedList);
    };

    const handleChangeDateMasterList = (value, name, index) => {
        // ตรวจสอบว่า value เป็น moment object หรือไม่
        const newValue = value && value instanceof moment ? value.format('YYYY-MM-DD') : value;

        // อัปเดตค่าใน formMasterList
        const updatedList = [...formMasterList];
        updatedList[index][name] = formatDateOnChange(newValue);
        setFormMasterList(updatedList);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของเอกสารอ้างอิง
    const handleChangePayType = (value) => {
        const newPayMasterModel = [payMasterModel()];
        setFormMasterList(newPayMasterModel);
        setFormDetailList([]);
        setSelectedDiscountValueType("2");
        setTotalPrice(0);
        setReceiptDiscount(0);
        setSubFinal(0);
        setGrandTotal(0);
        setIsVatChecked(false);
        setVatAmount(0);
        setDocRefType(value);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของสถานะจ่าย
    const handlePaymentStatusChange = (status) => {
        // เก็บค่าของ formMasterList ที่มีอยู่เดิม
        const currentList = formMasterList[0] ? formMasterList[0] : payMasterModel();

        // เก็บค่า ap ข้อมูลไว้ก่อน
        const apData = {
            apID: currentList.apID,
            apCode: currentList.apCode,
            apName: currentList.apName,
            apAdd1: currentList.apAdd1,
            apAdd2: currentList.apAdd2,
            apAdd3: currentList.apAdd3,
            apProvince: currentList.apProvince,
            apZipcode: currentList.apZipcode,
            apTaxNo: currentList.apTaxNo
        };

        if (status === 'oneTime') {
            // ตั้งค่าให้กับรายการเดียว โดยเก็บค่าเดิมไว้ที่ตำแหน่งที่ 0
            setFormMasterList([{
                ...currentList,
                amountPay: formatCurrency(grandTotal),
                docRemark1: '',
                docRemark2: '',
                ...apData // ตั้งค่า ap ข้อมูลกลับไป
            }]);
            setInstallmentCount(1); // ย้ายการตั้งค่ามาหลังจากกำหนด formMasterList แล้ว
        } else {
            // สร้างรายการตามจำนวน installmentCount โดยไม่เคลียร์ datePay
            const newList = Array.from({ length: installmentCount }, (v, i) => {
                let amountPay = (grandTotal / installmentCount).toFixed(2);
                if (i === installmentCount - 1) {
                    amountPay = (grandTotal - (amountPay * (installmentCount - 1))).toFixed(2);
                }
                return {
                    ...payMasterModel(),
                    amountPay: formatCurrency(amountPay),
                    docRemark1: '',
                    docRemark2: '',
                    ...apData // ตั้งค่า ap ข้อมูลกลับไป
                };
            });
            // ตั้งค่าให้กับ formMasterList โดยเก็บค่าเดิมไว้ที่ตำแหน่งที่ 0 และแทนที่ค่าใหม่
            newList[0] = currentList;
            setFormMasterList(newList);
        }

        setPaymentStatus(status); // ย้ายการตั้งค่ามาหลังจากกำหนด formMasterList แล้ว
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของจำนวนงวด
    const handleInstallmentCountChange = (value) => {
        if (!/^\d*$/.test(value)) return 0;  // ตรวจสอบว่าเป็นตัวเลขเท่านั้น

        const count = parseInt(value, 10);  // แปลงค่าจาก string เป็น number

        // เก็บค่าของ formMasterList ที่มีอยู่เดิม
        const currentList = formMasterList[0] ? formMasterList[0] : payMasterModel();

        // เก็บค่า ap ข้อมูลไว้ก่อน
        const apData = {
            apID: currentList.apID,
            apCode: currentList.apCode,
            apName: currentList.apName,
            apAdd1: currentList.apAdd1,
            apAdd2: currentList.apAdd2,
            apAdd3: currentList.apAdd3,
            apProvince: currentList.apProvince,
            apZipcode: currentList.apZipcode,
            apTaxNo: currentList.apTaxNo
        };

        // สร้าง default model ที่ใช้เป็นค่าเริ่มต้น
        const defaultModel = payMasterModel();

        // คำนวณ amountPay สำหรับแต่ละงวด
        const installmentAmount = (grandTotal / count).toFixed(2);
        let newList = Array.from({ length: count }, (v, i) => {
            let amountPay = installmentAmount;
            if (i === count - 1) {
                amountPay = (grandTotal - (installmentAmount * (count - 1))).toFixed(2);
            }
            return {
                ...defaultModel,
                amountPay: formatCurrency(parseInt(amountPay)),
                docRemark1: '', // เคลียร์ค่าเฉพาะที่ต้องการ
                docRemark2: '', // เคลียร์ค่าเฉพาะที่ต้องการ
                ...apData // ตั้งค่า ap ข้อมูลกลับไป
            };
        });

        setInstallmentCount(count);  // ตั้งค่าจำนวนงวด
        setFormMasterList(newList);  // อัปเดต formMasterList
    };

    // ฟังก์ชันสำหรับลบแถวใน formMasterList
    // const handleRemoveMasterRow = (index) => {
    //     const updatedList = formMasterList.filter((_, i) => i !== index);
    //     setFormMasterList(updatedList);
    // };

    // SET REC
    const [showRecModal, setShowRecModal] = useState(false);
    const handleRecShow = () => setShowRecModal(true);
    const handleRecClose = () => setShowRecModal(false);
    const onRowSelectRec = async (recSelected) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับ recSelected.Rec_No ใน REC_H และ AP_ID ใน apDataList
            const [getAllRecH, getAllItem] = await Promise.all([
                getAllData('API_0301_REC_H', 'ORDER BY Rec_No DESC'),
                getAllData('API_0302_REC_D', 'ORDER BY Line ASC')
            ]);

            // ใช้ Set เพื่อหลีกเลี่ยงการค้นหาซ้ำ
            const recNoSet = new Set(recSelected.map(rec => rec.Rec_No));
            const recNoArray = Array.from(recNoSet);

            // ฟังก์ชันเพื่อสร้างโมเดลใหม่สำหรับแต่ละแถวและคำนวณ itemTotal
            const createNewRow = (index, itemSelected) => {
                const itemQty = Number(itemSelected.Item_Qty) || 0;
                const itemPriceUnit = Number(itemSelected.Item_Price_Unit) || 0;
                const itemDiscount = Number(itemSelected.Item_Discount) || 0;
                let itemTotal = itemQty * itemPriceUnit;

                if (itemSelected.Item_DisType === 2) {
                    itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
                } else {
                    itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
                }

                return {
                    ...payDetailModel(index + 1),
                    recDtId: itemSelected.DT_Id,
                    recId: itemSelected.Rec_ID,
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    recNo: itemSelected.Rec_No,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemUnit: itemSelected.Item_Unit,
                    itemPriceUnit,
                    itemDiscount,
                    itemDisType: String(itemSelected.Item_DisType),
                    itemTotal,
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            // สร้างฟังก์ชันสำหรับการดึงข้อมูลของแต่ละ Rec_No
            const fetchDetailsForRecNo = async (recNo) => {
                const filterItem = getAllItem.filter(item => item.Rec_No === recNo);
                const fromViewRecH = getAllRecH.find(po => po.Rec_No === recNo);

                if (!fromViewRecH) {
                    throw new Error(`ไม่พบข้อมูล REC_H สำหรับ Rec_No: ${recNo}`);
                }

                // การสร้างรายละเอียด
                if (filterItem.length > 0) {
                    const newFormDetails = filterItem.map((item, index) => createNewRow(index, item));
                    return { fromViewRecH, newFormDetails };
                } else {
                    throw new Error(`ไม่พบข้อมูล REC_D สำหรับ Rec_No: ${recNo}`);
                }
            };

            // ดึงข้อมูลสำหรับ Rec_No ทั้งหมดใน recSelected
            const results = await Promise.all(recNoArray.map(recNo => fetchDetailsForRecNo(recNo)));

            // รวมข้อมูลทั้งหมด
            const allDetails = results.flatMap(result => result.newFormDetails);

            // ดึงข้อมูล PO สำหรับการคำนวณส่วนลด
            const [getViewPoH] = await Promise.all([
                getAllData('API_0201_PO_H', '')
            ]);

            let receiptDiscount = 0;
            let receiptVatAmount = 0;

            recSelected.forEach((rec) => {
                const relatedPoH = getViewPoH.find(po => po.Doc_ID === rec.Ref_DocID);

                if (relatedPoH) {
                    // คำนวณส่วนลด
                    const discountValue = relatedPoH.Discount_Value_Type === 2
                        ? (relatedPoH.Discount_Value / 100) * rec.NetTotal // ส่วนลดเป็นเปอร์เซ็นต์
                        : relatedPoH.Discount_Value; // ส่วนลดเป็นจำนวนเงิน

                    receiptDiscount += discountValue;

                    // คำนวณ VAT ถ้า IsVat เท่ากับ 1
                    if (relatedPoH.IsVat === 1) {
                        // คำนวณจำนวน VAT
                        const vatAmount = (rec.NetTotal - discountValue) * 0.07; // 7% VAT
                        receiptVatAmount += vatAmount;
                        setIsVatChecked(true);
                    }
                }
            });

            // ตั้งค่า formDetailList และ formMasterList
            setFormDetailList(allDetails);

            // อัปเดต formMasterList สำหรับทุกรายการ
            setFormMasterList(prevState =>
                prevState.map(item => ({
                    ...item,
                    // refDocID: results[0].fromViewRecH.Rec_Id,
                    // refDocDate: formatThaiDateUi(recSelected[0].Rec_Date),
                    payDate: formatThaiDateUi(moment()),
                    docDueDate: formatThaiDateUi(moment()),
                    // docRemark1: results[0].fromViewRecH.Doc_Remark1,
                    // docRemark2: results[0].fromViewRecH.Doc_Remark2,
                    // docType: results[0].fromViewRecH.Doc_Type,
                    // docFor: results[0].fromViewRecH.Doc_For,
                    transportType: results[0].fromViewRecH.Transport_Type,
                    apID: results[0].fromViewRecH.AP_ID,
                    apCode: results[0].fromViewRecH.AP_Code,
                    apName: results[0].fromViewRecH.AP_Name,
                    apAdd1: results[0].fromViewRecH.AP_Add1,
                    apAdd2: results[0].fromViewRecH.AP_Add2,
                    apAdd3: results[0].fromViewRecH.AP_Add3,
                    apProvince: results[0].fromViewRecH.AP_Province,
                    apZipcode: results[0].fromViewRecH.AP_Zipcode,
                    apTaxNo: results[0].fromViewRecH.AP_TaxNo,
                    createdByName: window.localStorage.getItem('name'),
                    createdDate: getCreateDateTime(),
                    updateDate: results[0].fromViewRecH.Update_By_Name,
                    updateByName: results[0].fromViewRecH.Update_Date,
                }))
            );

            // ตั้งค่าส่วนลดและ VAT ใน State
            setReceiptDiscount(receiptDiscount);
            setVatAmount(receiptVatAmount);

            handleRecClose(); // ปิด modal หลังจากเลือก
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };
    const onConfirmRecSelection = async (recSelected) => {
        try {
            if (!recSelected[0]) {
                getAlert("FAILED", "ท่านยังไม่ได้เลือกใบรับสินค้า");
                return;
            }

            handleRecClose();

            // เคลียร์ค่าใน formMasterList และ formDetailList
            setFormMasterList([payMasterModel()]);
            setFormDetailList([]);

            onRowSelectRec(recSelected);

            // แจ้งเตือนผู้ใช้ว่าการเลือกสำเร็จ
            getAlert("OK", "การเลือกใบรับสินค้าสำเร็จ");
        } catch (error) {
            console.error("Error in confirming receipt selection:", error);
            getAlert("FAILED", "เกิดข้อผิดพลาดในการเลือกใบรับสินค้า");
        }
    };

    // SET DEPOS
    const [showDeposModal, setShowDeposModal] = useState(false);
    const handleDeposShow = () => setShowDeposModal(true);
    const handleDeposClose = () => setShowDeposModal(false);
    const onRowSelectDepos = async (deposSelected) => {
        try {
            // เคลียร์ค่าใน formMasterList และ formDetailList
            setFormMasterList([payMasterModel()]);
            setFormDetailList([]);

            // ค้นหารายการใบมัดจำ
            const [findDeposMaster] = await Promise.all([
                getAllData('DEPOS_H', ''),
            ]);
            const fromDeposDatabase = findDeposMaster.find(depos => depos.Doc_No === deposSelected.Doc_No);

            if (!fromDeposDatabase) {
                throw new Error("ไม่พบข้อมูลเอกสาร");
            }

            // ฟังก์ชันเพื่อสร้างโมเดลใหม่สำหรับแต่ละแถวและคำนวณ itemTotal
            const createNewRow = (index, itemSelected) => {
                const itemQty = Number(itemSelected.Item_Qty) || 0;
                const itemPriceUnit = Number(itemSelected.Item_Price_Unit) || 0;
                const itemDiscount = Number(itemSelected.Item_Discount) || 0;
                let itemTotal = itemQty * itemPriceUnit;

                if (itemSelected.Item_DisType === 2) {
                    itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
                } else {
                    itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
                }

                return {
                    ...payDetailModel(index + 1),
                    docId: itemSelected.Doc_ID,
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    recNo: itemSelected.Rec_No,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemUnit: itemSelected.Item_Unit,
                    itemPriceUnit: formatCurrency(itemPriceUnit),
                    itemDiscount: formatCurrency(itemDiscount),
                    itemDisType: String(itemSelected.Item_DisType),
                    itemTotal,
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            // ค้นหาข้อมูลของ Detail ด้วย Doc_ID
            const fromDeposDetail = await getByDocId('DEPOS_D', fromDeposDatabase.Doc_Id, `AND Item_Status = 1 ORDER BY Line ASC`);

            if (fromDeposDetail.length > 0) {
                const newFormDetails = fromDeposDetail.map((item, index) => createNewRow(formDetailList.length + index, item));
                setFormDetailList(newFormDetails);
                setFormMasterList([{
                    // สำหรับตารางจ่าย
                    datePay: formatThaiDateUi(moment()),
                    //amountPay: 0,

                    // ข้อมูลทั่วไป
                    payNo: maxPayNo,
                    payDate: formatThaiDateUi(moment()),
                    docDueDate: formatThaiDateUi(moment()),
                    refDoc: deposSelected.Doc_No,
                    refDocDate: formatThaiDateUi(deposSelected.Doc_Date || null),
                    transportType: deposSelected.Transport_Type,
                    apID: deposSelected.AR_ID,
                    apCode: deposSelected.AR_Code,
                    apName: deposSelected.AR_Name,
                    discountValue: deposSelected.Discount_Value,
                    discountValueType: deposSelected.Discount_Value_Type,
                    isVat: deposSelected.IsVat,
                    ccreatedDate: setCreateDateTime(deposSelected.Created_Date || null),
                    createdByName: deposSelected.Created_By_Name,
                    createdById: deposSelected.Created_By_Id,
                    updateDate: setCreateDateTime(new Date()),
                    updateByName: window.localStorage.getItem('name'),
                    updateById: window.localStorage.getItem('emp_id'),
                    approvedDate: setCreateDateTime(deposSelected.Approved_Pay_Date || null),
                    approvedByName: deposSelected.Approved_Pay_By_Name,
                    approvedById: deposSelected.Approved_Pay_By_Id,
                    printedStatus: deposSelected.Printed_Status
                }]);
            }

            handleDeposClose(); // ปิด modal หลังจากเลือก
        } catch (error) {
            getAlert("FAILED", error);
        }
    };

    // SET AP
    const [showApModal, setShowApModal] = useState(false);
    const handleApShow = () => setShowApModal(true);
    const handleApClose = () => setShowApModal(false);
    const onRowSelectAp = (apSelected) => {
        try {
            // เก็บค่าของ formMasterList ที่มีอยู่เดิม
            const currentList = formMasterList[0] ? formMasterList[0] : payMasterModel();

            // เก็บค่า ap ข้อมูลไว้ก่อน
            const apData = {
                apID: apSelected.AP_Id,
                apCode: apSelected.AP_Code,
                apName: apSelected.AP_Name,
                apAdd1: apSelected.AP_Add1,
                apAdd2: apSelected.AP_Add2,
                apAdd3: apSelected.AP_Add3,
                apProvince: apSelected.AP_Province,
                apZipcode: apSelected.AP_Zipcode,
                apTaxNo: apSelected.AP_TaxNo
            };

            // ตั้งค่าให้กับรายการเดียว โดยเก็บค่าเดิมไว้ที่ตำแหน่งที่ 0
            setFormMasterList([{
                ...currentList,
                ...apData // ตั้งค่า ap ข้อมูลกลับไป
            }]);


            handleApClose(); // ปิด modal หลังจากเลือก
        } catch (error) {
            getAlert("FAILED", error);
        }
    };

    // SET ITEM
    const [showItemModal, setShowItemModal] = useState(false);
    const handleItemShow = () => setShowItemModal(true);
    const handleItemClose = () => setShowItemModal(false);
    const onRowSelectItem = (itemSelected) => {
        try {
            const newRow = payDetailModel(formDetailList.length + 1);

            setFormDetailList([
                ...formDetailList,
                {
                    ...newRow,
                    line: null,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty: 0,
                    itemUnit: itemSelected.Item_Unit_ST,
                    itemPriceUnit: formatCurrency(itemSelected.Item_Cost || 0),
                    itemDiscount: formatCurrency(0),
                    itemDisType: '1',
                    itemTotal: 0,
                    itemStatus: itemSelected.Item_Status,
                    whId: null,
                    whName: itemSelected.WH_Name,
                    zoneId: null,
                    ltId: null,
                    dsSeq: null,
                }
            ]);

            handleItemClose(); // ปิด modal หลังจากเลือก
        } catch (error) {
            getAlert("FAILED", error);
        }
    };
    const handleRemoveRow = (index) => {
        const newList = formDetailList.filter((_, i) => i !== index);
        setFormDetailList(newList);
    };
    // const handleVatChange = () => {
    //     setIsVatChecked(prev => !prev);
    // };

    // การใช้ Tab เพื่อเปลี่ยน Form
    const [activeTab, setActiveTab] = useState('summary');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // การคำนวณยอดรวม (totalPrice)
    useEffect(() => {
        const total = formDetailList.reduce((acc, item) => acc + (Number(item.itemTotal) || 0), 0);
        setTotalPrice(total);
    }, [formDetailList]);

    // การคำนวณส่วนลด (receiptDiscount)
    useEffect(() => {
        // let discountValue = Number(formMasterList.discountValue || 0);
        // let receiptDiscount = 0;

        // if (selectedDiscountValueType === '2') { // เปอร์เซ็นต์
        //     receiptDiscount = (totalPrice / 100) * discountValue;
        // } else if (selectedDiscountValueType === '1') { // จำนวนเงิน
        //     receiptDiscount = discountValue;
        // }

        // setReceiptDiscount(receiptDiscount);
    }, [totalPrice, formMasterList.discountValue, selectedDiscountValueType]);

    // การคำนวณยอดหลังหักส่วนลด (subFinal) (ไม่ได้ใช้)
    useEffect(() => {
        const subFinal = totalPrice - receiptDiscount;
        setSubFinal(subFinal);
    }, [totalPrice, receiptDiscount]);

    // การคำนวณ VAT (vatAmount)
    useEffect(() => {
        //const vat = isVatChecked ? subFinal * 0.07 : 0;
        //setVatAmount(vat);
    }, [subFinal, isVatChecked]);

    // การคำนวณยอดรวมทั้งสิ้น (grandTotal)
    useEffect(() => {
        const grandTotal = subFinal + vatAmount;
        setGrandTotal(grandTotal);

        // Default ตามรวมทั้งสิ้น
        if (mode !== 'U') {
            const formattedValue = formatCurrency(grandTotal);
            const updatedList = [...formMasterList];
            updatedList[0].amountPay = formattedValue;
            setFormMasterList(updatedList);
        }
    }, [subFinal, vatAmount]);

    const [showModalDatePicker, setShowModalDatePicker] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);

    const openModalDatePicker = (index) => {
        setSelectedDateIndex(index);
        setShowModalDatePicker(true);
    };

    const closeModalDatePicker = () => setShowModalDatePicker(false);

    return (
        <>
            <Breadcrumbs page={maxPayNo}
                isShowStatus={mode === 'U'}
                statusName={statusName}
                statusColour={statusColour}
                items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/payment-voucher' },
                    { name: mode === 'U' ? "เรียกดู" + name : "สร้าง" + name, url: '#' },
                ]}
            />
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสาร</label>
                        <Datetime
                            className="input-spacing-input-date"
                            name="payDate"
                            value={formMasterList[0]?.payDate || null}
                            onChange={(date) => handleChangeDateMasterList(date, 'payDate', 0)}
                            dateFormat="DD-MM-YYYY"
                            timeFormat={false}
                            inputProps={{ readOnly: true, disabled: mode === 'U' }}
                        />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label>ผู้ขาย</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control input-spacing"
                                name="apCode"
                                value={
                                    (formMasterList[0]?.apCode || '')
                                    + " " +
                                    (formMasterList[0]?.apName || '')
                                }
                                onChange={handleChangeMasterList}
                                disabled={true}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleApShow}
                                disabled={docRefType === '1' || docRefType === '3' || mode === 'U' ? true : false}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <ApModal
                        showApModal={showApModal}
                        handleApClose={handleApClose}
                        apDataList={apDataList}
                        onRowSelectAp={onRowSelectAp}
                    />
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>วันที่สร้างเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="createdDate"
                            value={formMasterList[0]?.createdDate}
                            // onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label className="me-2">เอกสารอ้างอิง</label>
                        <select
                            name="payType"
                            value={formMasterList[0]?.docRefType}
                            className="form-select form-control input-spacing"
                            onChange={(e) => handleChangePayType(e.target.value)}
                            disabled={mode === 'U'}>
                            <option value="1">จ่ายตามใบรับสินค้า</option>
                            <option value="2">จ่ายเฉพาะรายการ</option>
                            <option value="3">จ่ายตามใบมัดจำ</option>
                        </select>
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label>ที่อยู่</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="apAdd1"
                            value={formMasterList[0]?.apAdd1 || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>ผู้สร้างเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="createdByName"
                            value={formMasterList[0]?.createdByName || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>อ้างอิงเอกสาร</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control input-spacing"
                                name="refDoc"
                                value={formMasterList[0]?.refDoc || ''}
                                onChange={handleChangeMasterList}
                                disabled={true}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleRecShow}
                                hidden={docRefType === '1' ? false : true}
                                disabled={mode === 'U'}>
                                <i className="fas fa-search"></i>
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleDeposShow}
                                hidden={docRefType === '3' ? false : true}
                                disabled={mode === 'U'}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <RecModal
                            showRecModal={showRecModal}
                            handleRecClose={handleRecClose}
                            recDataList={recDataList}
                            onConfirmRecSelection={onConfirmRecSelection}
                        />
                        <DeposModal
                            showDeposModal={showDeposModal}
                            handleDeposClose={handleDeposClose}
                            deposDataList={deposDataList}
                            onRowSelectDepos={onRowSelectDepos}
                        />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label></label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            value={
                                (formMasterList[0]?.apAdd2 || '')
                                + " " +
                                (formMasterList[0]?.apAdd3 || '')
                            }
                            disabled={true} />
                    </div>
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>วันที่แก้ไขล่าสุด</label>
                        <input
                            // type="date"
                            type="text"
                            className="form-control input-spacing"
                            name="updateDate"
                            value={formMasterList[0]?.updateDate || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสารอ้างอิง</label>
                        <input
                            //type="date"
                            type="text"
                            className="form-control input-spacing"
                            name="refDocDate"
                            value={formMasterList[0]?.refDocDate || ''}
                            onChange={handleChangeMasterList}
                            disabled={true}
                        />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label></label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            value={
                                (formMasterList[0]?.apProvince || '')
                                + " " +
                                (formMasterList[0]?.apZipcode || '')
                            }
                            disabled={true} />
                    </div>
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>ผู้แก้ไขเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="updateByName"
                            value={formMasterList[0]?.updateByName || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>ประเภทเอกสาร</label>
                        <select
                            className="form-select form-control input-spacing"
                            name="docType"
                            value={formMasterList[0]?.docType}
                            onChange={handleChangeMasterList}
                            disabled={docRefType === '1' || docRefType === '3'}
                        >
                            {docRefType === '2' && tbDocType.map((docType) => (
                                <option key={docType.DocType_Id} value={docType.DocType_Id}>
                                    {docType.DocType_Name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label></label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            value={
                                formMasterList[0]?.apTaxNo || ''
                            }
                            disabled={true} />
                    </div>
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>วันที่อนุมัติ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedDate"
                            value={formMasterList[0]?.approvedDate || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วัตถุประสงค์</label>
                        <select
                            name="docFor"
                            value={formMasterList.docFor}
                            onChange={handleChangeMasterList}
                            disabled={docRefType === '1' || docRefType === '3'}
                            className="form-select form-control input-spacing"
                        >
                            {docRefType === '2' && (
                                <>
                                    <option value="1">ซื้อมาเพื่อใช้</option>
                                    <option value="2">ซื้อมาเพื่อขาย</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
                <div className="col-6" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>ผู้อนุมัติเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedByName"
                            value={formMasterList[0]?.approvedByName || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>Due Date</label>
                        <Datetime
                            className="input-spacing-input-date"
                            name="datePay"
                            value={formMasterList[0]?.datePay || null}
                            onChange={(date) => handleChangeDateMasterList(date, 'datePay', 0)}
                            dateFormat="DD-MM-YYYY"
                            timeFormat={false}
                            inputProps={{ readOnly: true, disabled: true }}
                        />
                    </div>
                </div>
                <div className="col-6" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>หมายเหตุอนุมัติ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedMemo"
                            value={formMasterList[0]?.approvedMemo || ''}
                            onChange={handleChangeMasterList}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-2">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a style={{ cursor: 'pointer', color: '#EF6C00' }}
                                        className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('summary')}>
                                        ยอดรวม
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a style={{ cursor: 'pointer', color: '#EF6C00' }}
                                        className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('details')}>
                                        รายละเอียดสินค้า
                                    </a>
                                </li>
                            </ul>
                        </div>
                        {activeTab === 'summary' ? (
                            <div className="card-body">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-4">
                                                    <div>
                                                        <h4 className="card-title">ยอดท้ายบิล</h4>
                                                        <div className="row mt-3">
                                                            <div className="col-12">
                                                                <div className="row">
                                                                    <div className="col-2">
                                                                        <label>สถานะจ่าย</label>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <div className="radio-inline">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="radio"
                                                                                name="paymentStatus"
                                                                                value="oneTime"
                                                                                checked={paymentStatus === 'oneTime'}
                                                                                onChange={() => handlePaymentStatusChange('oneTime')}
                                                                            />
                                                                            <label className="form-check-label">จ่ายครั้งเดียว</label>
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="radio"
                                                                                name="paymentStatus"
                                                                                value="installment"
                                                                                checked={paymentStatus === 'installment'}
                                                                                onChange={() => handlePaymentStatusChange('installment')}
                                                                            />
                                                                            <label className="form-check-label">จ่ายเป็นงวด</label>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        {paymentStatus === 'installment' && (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control text-end input-spacing"
                                                                                style={{ width: '100px' }}
                                                                                value={installmentCount}
                                                                                onChange={(e) => handleInstallmentCountChange(e.target.value)}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-2">
                                                                        <label>รวมราคา</label>
                                                                    </div>
                                                                    <div className="col-10">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end input-spacing"
                                                                            style={{ width: '100px' }}
                                                                            value={formatCurrency(totalPrice || 0)}
                                                                            disabled={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-4">
                                                                    <div className="col-2">
                                                                        <label>รวมส่วนลด</label>
                                                                    </div>
                                                                    <div className="col-10">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end input-spacing"
                                                                            style={{ width: '100px' }}
                                                                            value={formatCurrency(receiptDiscount || 0)}
                                                                            disabled={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row mt-4">
                                                                    <div className="col-2">
                                                                        <label>VAT (7%)</label>
                                                                    </div>
                                                                    <div className="col-10">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end input-spacing"
                                                                            style={{ width: '100px' }}
                                                                            value={formatCurrency(vatAmount || 0)}
                                                                            disabled={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row mt-4">
                                                                    <div className="col-2">
                                                                        <label><h5>รวมทั้งสิ้น</h5></label>
                                                                    </div>
                                                                    <div className="col-10">
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
                                                <div className="col-8">
                                                    <div>
                                                        <div className="row mt-3">
                                                            <div className="col-12">
                                                                <div className="row">
                                                                    <div className="col-12">
                                                                        <div className="card">
                                                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                                                <h4 className="card-title">ตารางจ่าย</h4>
                                                                            </div>
                                                                            <div className="card-body">
                                                                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto', zIndex: '1' }}>
                                                                                    <table className="table table-striped table-hover">
                                                                                        <thead className="thead-dark">
                                                                                            <tr>
                                                                                                <th className="text-center" style={{ width: '2%' }}>#</th>
                                                                                                <th className="text-center" style={{ width: '18%' }}>วันที่จ่าย</th>
                                                                                                <th className="text-center" style={{ width: '18%' }}>จำนวนเงิน</th>
                                                                                                <th className="text-center" style={{ width: '31%' }}>รายละเอียดเอกสาร</th>
                                                                                                <th className="text-center" style={{ width: '31%' }}>หมายเหตุธุรการ</th>
                                                                                                {/* <th className="tex  t-center" style={{ width: '2%' }}>ลบ</th> */}
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {formMasterList.map((item, index) => (
                                                                                                <tr key={index + 1}>
                                                                                                    <td className="text-center">{index + 1}</td>
                                                                                                    <td className="text-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control text-center"
                                                                                                            value={item.datePay ? item.datePay : 'เลือกวันที่'}
                                                                                                            onClick={() => openModalDatePicker(index)}
                                                                                                        />
                                                                                                        {/* <Datetime
                                                                                                            className="input-spacing-input-date"
                                                                                                            name="datePay"
                                                                                                            value={item.datePay ? moment(item.datePay) : null}
                                                                                                            onChange={(date) => handleChangeDateMasterList(index, 'datePay', date)}
                                                                                                            dateFormat="DD-MM-YYYY"
                                                                                                            timeFormat={false}
                                                                                                        /> */}
                                                                                                        {/* <input
                                                                                                            type="date"
                                                                                                            className="form-control text-center"
                                                                                                            value={item.datePay || 0}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'datePay', e.target.value)}
                                                                                                        /> */}
                                                                                                    </td>
                                                                                                    <td className="text-end">
                                                                                                        {/* <input
                                                                                                            type="text"
                                                                                                            className="form-control text-end input-spacing"
                                                                                                            value={item.amountPay || grandTotal}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'amountPay', e.target.value)}
                                                                                                        /> */}
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control text-end input-spacing"
                                                                                                            value={item.amountPay || ''}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'amountPay', e.target.value)}
                                                                                                            onFocus={(e) => handleFocusMaster(index, 'amountPay')}
                                                                                                            onBlur={(e) => handleBlurMaster(index, 'amountPay', e.target.value)}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="text-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            value={item.docRemark1 || ''}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'docRemark1', e.target.value)}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="text-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            value={item.docRemark2 || ''}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'docRemark2', e.target.value)}
                                                                                                        />
                                                                                                    </td>
                                                                                                    {/* <td className="text-center">
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            className="btn btn-danger"
                                                                                                            onClick={() => handleRemoveMasterRow(index)}
                                                                                                        >
                                                                                                            ลบ
                                                                                                        </button>
                                                                                                    </td> */}
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>

                                                                                    {/* Modal For DatePicker */}
                                                                                    <div className={`modal fade ${showModalDatePicker ? 'show' : ''}`} style={{ display: showModalDatePicker ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                                                                                        <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                                                                                            <div className="modal-content">
                                                                                                <div className="modal-header" style={{ backgroundColor: '#EF6C00' }}>
                                                                                                    <h5 className="modal-title text-white">เลือกวันที่</h5>
                                                                                                    <button type="button" className="close" onClick={closeModalDatePicker}>
                                                                                                        <span>&times;</span>
                                                                                                    </button>
                                                                                                </div>
                                                                                                <div className="modal-body" style={{ backgroundColor: '#F5F7FD' }}>
                                                                                                    <Datetime
                                                                                                        className="input-spacing-input-date"
                                                                                                        name="datePay"
                                                                                                        value={formMasterList[selectedDateIndex]?.datePay || null}
                                                                                                        onChange={(date) => {
                                                                                                            handleChangeDateMasterList(date, 'datePay', selectedDateIndex);
                                                                                                            closeModalDatePicker();
                                                                                                        }}
                                                                                                        dateFormat="DD-MM-YYYY"
                                                                                                        timeFormat={false}
                                                                                                        inputProps={{ readOnly: true, disabled: false }}
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-body">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h4 className="card-title">รายละเอียดสินค้า</h4>
                                            <button
                                                type="button"
                                                className="btn custom-button"
                                                onClick={handleItemShow}
                                                hidden={docRefType === '1' || docRefType === '3' ? true : false}>
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
                                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                <table id="basic-datatables" className="table table-striped table-hover">
                                                    <thead className="thead-dark">
                                                        <tr>
                                                            <th className="text-center" style={{ width: '2%' }}>#</th>
                                                            {docRefType === '1' && (
                                                                <th className="text-center" style={{ width: '8%' }}>
                                                                    เลขที่เอกสาร (REC)
                                                                </th>
                                                            )}
                                                            <th className="text-center" style={{ width: docRefType !== '1' ? '12%' : '10%' }}>
                                                                รหัสสินค้า
                                                            </th>
                                                            <th className="text-center" style={{ width: docRefType === '1' ? '16%' : '20%' }}>
                                                                ชื่อสินค้า
                                                            </th>
                                                            <th className="text-center" style={{ width: '8%' }}>จำนวน</th>
                                                            <th className="text-center" style={{ width: '6%' }}>หน่วย</th>
                                                            <th className="text-center" style={{ width: '8%' }}>ราคาต่อหน่วย</th>
                                                            <th className="text-center" style={{ width: '8%' }}>ส่วนลด</th>
                                                            <th className="text-center" style={{ width: '5%' }}>%</th>
                                                            <th className="text-center" style={{ width: '10%' }}>จำนวนเงินรวม</th>
                                                            {docRefType === '2' && (
                                                                <th className="text-center" style={{ width: '16%' }}>
                                                                    คลังสินค้า
                                                                </th>
                                                            )}
                                                            {docRefType === '2' && (
                                                                <th className="text-center" style={{ width: '3%' }}>ลบ</th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formDetailList.map((item, index) => (
                                                            <tr key={item.itemId || index + 1}>
                                                                {/* # */}
                                                                <td className="text-center">{index + 1}</td>

                                                                {/* # RecNo */}
                                                                <td hidden={docRefType === '1' ? false : true}
                                                                    className="text-center">
                                                                    <span>{item.recNo || ''}</span>
                                                                </td>

                                                                {/* รหัสสินค้า */}
                                                                <td className="text-center">
                                                                    <span>{item.itemCode || ''}</span>
                                                                </td>

                                                                {/* ชื่อสินค้า */}
                                                                <td className="text-left">
                                                                    <span>{item.itemName || ''}</span>
                                                                </td>

                                                                {/* จำนวน */}
                                                                <td className="text-center">
                                                                    {docRefType === '1' ? (
                                                                        <span>{item.itemQty || 0}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-center"
                                                                            value={item.itemQty || 0}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                                            disabled={docRefType === '1' ? true : false}
                                                                        />
                                                                    )}
                                                                </td>

                                                                {/* หน่วย */}
                                                                <td className="text-center">
                                                                    <span>{item.itemUnit || ''}</span>
                                                                </td>

                                                                {/* ราคาต่อหน่วย */}
                                                                <td className="text-end">
                                                                    {docRefType === '1' || docRefType === '3' ? (
                                                                        <span>{item.itemPriceUnit || 0}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end"
                                                                            value={item.itemPriceUnit || ''}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemPriceUnit', e.target.value)}
                                                                            onFocus={(e) => handleFocusDetail(index, 'itemPriceUnit')}
                                                                            onBlur={(e) => handleBlurDetail(index, 'itemPriceUnit', e.target.value)}
                                                                            disabled={docRefType === '1' || docRefType === '3' ? true : false}
                                                                        />
                                                                    )}
                                                                </td>

                                                                {/* ส่วนลด */}
                                                                <td className="text-end">
                                                                    {docRefType === '1' || docRefType === '3' ? (
                                                                        <span>{item.itemDiscount || 0}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end"
                                                                            value={item.itemDiscount || 0}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemDiscount', e.target.value)}
                                                                            onFocus={(e) => handleFocusDetail(index, 'itemDiscount')}
                                                                            onBlur={(e) => handleBlurDetail(index, 'itemDiscount', e.target.value)}
                                                                            disabled={docRefType === '1' || docRefType === '3' ? true : false}
                                                                        />
                                                                    )}
                                                                </td>

                                                                {/* % */}
                                                                <td className="text-center">
                                                                    {docRefType === '1' || docRefType === '3' ? (
                                                                        <span>{item.itemDisType === "1" ? "฿" : item.itemDisType === "2" ? "%" : ""}</span>
                                                                    ) : (
                                                                        <select
                                                                            className="form-select"
                                                                            value={item.itemDisType || ''}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemDisType', e.target.value)}
                                                                            disabled={docRefType === '1' || docRefType === '3' ? true : false}
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

                                                                {docRefType === '2' ? (
                                                                    <>
                                                                        {/* คลังสินค้า */}
                                                                        <td className="text-center">
                                                                            <select
                                                                                name="whId"
                                                                                value={item.whId}
                                                                                onChange={(e) => handleChangeDetail(index, 'whId', e.target.value)}
                                                                                className="form-select form-control"
                                                                            >
                                                                                {whDataList.map((warehouse) => (
                                                                                    <option key={warehouse.WH_Id} value={warehouse.WH_Id}>
                                                                                        {warehouse.WH_Name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </td>

                                                                        {/* ลบ */}
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-danger"
                                                                                onClick={() => handleRemoveRow(index)}
                                                                                disabled={docRefType === '1' || docRefType === '3'}
                                                                            >
                                                                                ลบ
                                                                            </button>
                                                                        </td>
                                                                    </>
                                                                ) : null}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <FormAction onSubmit={handleSubmit} mode={mode} />
            </div>
            <br />
        </>
    );
}

export default Form;
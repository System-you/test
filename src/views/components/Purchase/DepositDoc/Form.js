import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// React DateTime
import Datetime from 'react-datetime';
import moment from 'moment';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import ArModal from '../../Modal/ArModal';
import ItemTable from '../../Content/ItemTable';
import Summary from '../../Footer/Summary';
import FormAction from '../../Actions/FormAction';

// Model
import { deposMasterModel } from '../../../../model/Purchase/DeposMasterModel';
import { deposDetailModel } from '../../../../model/Purchase/DeposDetailModel';

// Utils
import {
    getAllData,
    getByDocId,
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
    getMaxDocNo,
    setCreateDateTime,
    deleteDetail
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxDocNo }) {
    const [formMasterList, setFormMasterList] = useState(deposMasterModel());
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [arDataList, setArDataList] = useState([]);
    const [itemDataList, setItemDataList] = useState([]);
    const [whDataList, setWhDataList] = useState([]);

    // การคำนวณเงิน
    const [selectedDiscountValueType, setSelectedDiscountValueType] = useState("2");
    const [totalPrice, setTotalPrice] = useState(0);
    const [receiptDiscount, setReceiptDiscount] = useState(0);
    const [subFinal, setSubFinal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [isVatChecked, setIsVatChecked] = useState(false);
    const [vatAmount, setVatAmount] = useState(0);

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

            // สำหรับ View เข้ามาเพื่อแก้ไขข้อมูล
            if (mode === 'U') {
                await getModelByNo(arDataList);
            }
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const getModelByNo = async (arDataList) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับใน AP_ID ใน apDataList
            const [findMaster] = await Promise.all([
                getAllData('DEPOS_H', ''),
            ]);
            const fromDatabase = findMaster.find(depos => depos.Doc_No === maxDocNo);

            // ค้นหาข้อมูลผู้ขายด้วย AP_ID
            const [fromViewAr] = await Promise.all([
                arDataList.find(ap => ap.AR_Id === fromDatabase.AR_ID)
            ]);

            if (!fromDatabase || !fromViewAr) {
                throw new Error("Data not found");
            };

            // ฟังก์ชันเพื่อสร้างโมเดลใหม่สำหรับแต่ละแถวและคำนวณ itemTotal
            const createNewRow = (index, itemSelected) => {
                const itemQty = Number(itemSelected.Item_Qty) || 0;
                const itemPriceUnit = Number(itemSelected.Item_Price_Unit) || 0;
                const itemDiscount = Number(itemSelected.Item_Discount) || 0;
                const ItemDisType = String(itemSelected.Item_DisType);
                let itemTotal = itemQty * itemPriceUnit;

                if (ItemDisType === '2') {
                    itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
                } else {
                    itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
                }

                return {
                    ...deposDetailModel(index + 1),
                    dtId: itemSelected.DT_Id,
                    docId: itemSelected.Doc_ID,
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemUnit: itemSelected.Item_Unit,
                    itemPriceUnit: formatCurrency(itemPriceUnit),
                    itemDiscount: formatCurrency(itemDiscount),
                    itemDisType: String(itemSelected.Item_DisType),
                    itemTotal: itemTotal,
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            // ค้นหาข้อมูลของ Detail ด้วย Doc_ID
            const fromDetail = await getByDocId('DEPOS_D', fromDatabase.Doc_Id, `ORDER BY Line ASC`);

            if (fromDetail.length > 0) {
                const newFormDetails = fromDetail.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                setFormMasterList({
                    docId: fromDatabase.Doc_Id,
                    docNo: fromDatabase.Doc_No,
                    docDate: formatThaiDateUi(fromDatabase.Doc_Date || null),
                    docDueDate: formatThaiDateUi(fromDatabase.Doc_DueDate || null),
                    docStatus: fromDatabase.Doc_Status,
                    docCode: fromDatabase.Doc_Code,
                    docType: fromDatabase.Doc_Type,
                    docFor: fromDatabase.Doc_For,
                    refDocID: fromDatabase.Ref_DocID,
                    refDoc: fromDatabase.Ref_Doc,
                    refDocDate: formatThaiDateUi(fromDatabase.Ref_DocDate),
                    compId: fromDatabase.Comp_Id,
                    refProjectID: fromDatabase.Ref_ProjectID,
                    refProjectNo: fromDatabase.Ref_ProjectNo,
                    transportType: fromDatabase.Transport_Type,
                    docRemark1: fromDatabase.Doc_Remark1,
                    docRemark2: fromDatabase.Doc_Remark2,
                    arID: fromDatabase.AR_ID,
                    arCode: fromDatabase.AR_Code,
                    actionHold: fromDatabase.Action_Hold,
                    discountValue: fromDatabase.Discount_Value,
                    discountValueType: fromDatabase.Discount_Value_Type,
                    discountCash: fromDatabase.Discount_Cash,
                    discountCashType: fromDatabase.Discount_Cash_Type,
                    discountTransport: fromDatabase.Discount_Transport,
                    discountTransportType: fromDatabase.Discount_Transport_Type,
                    isVat: fromDatabase.IsVat,
                    docSEQ: fromDatabase.Doc_SEQ,
                    creditTerm: fromDatabase.CreditTerm,
                    creditTerm1Day: fromDatabase.CreditTerm1Day,
                    creditTerm1Remark: fromDatabase.CreditTerm1Remark,
                    creditTerm2Remark: fromDatabase.CreditTerm2Remark,
                    accCode: fromDatabase.ACC_Code,
                    empName: fromDatabase.EmpName,
                    createdDate: setCreateDateTime(fromDatabase.Created_Date || null),
                    createdByName: fromDatabase.Created_By_Name,
                    createdById: fromDatabase.Created_By_Id,
                    updateDate: setCreateDateTime(new Date()),
                    updateByName: window.localStorage.getItem('name'),
                    updateById: "1",
                    cancelDate: setCreateDateTime(fromDatabase.Cancel_Date || null),
                    cancelByName: fromDatabase.Cancel_By_Name,
                    cancelById: fromDatabase.Cancel_By_Id,
                    printedStatus: fromDatabase.Printed_Status,
                    printedDate: setCreateDateTime(fromDatabase.Printed_Date || null),
                    printedBy: fromDatabase.Printed_By,
                    confirmById: fromDatabase.Confirm_By_Id,
                    confirmDate: setCreateDateTime(fromDatabase.Confirm_Date || null),
                    confirmByName: fromDatabase.Confirm_By_Name,
                    payType: fromDatabase.Pay_Type,
                    approvedPayDate: setCreateDateTime(fromDatabase.Approved_Pay_Date || null),
                    approvedPayByName: fromDatabase.Approved_Pay_By_Name,
                    approvedPayById: fromDatabase.Approved_Pay_By_Id,
                    custName: fromDatabase.Cust_Name,
                    custTel: fromDatabase.Cust_Tel,
                    custMail: fromDatabase.Cust_Mail,
                    custConfirmMemo: fromDatabase.Cust_Confirm_Memo,

                    // แสดงรายชื่อผู้ขาย
                    arName: fromViewAr.AR_Name,
                    arAdd1: fromViewAr.AR_Add1,
                    arAdd2: fromViewAr.AR_Add2,
                    arAdd3: fromViewAr.AR_Add3,
                    arProvince: fromViewAr.AR_Province,
                    arZipcode: fromViewAr.AR_Zipcode,
                    arTaxNo: fromViewAr.AR_TaxNo
                });

                setIsVatChecked(fromDatabase.IsVat === 1 ? true : false);

                const discountValueType = Number(fromDatabase.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${fromDatabase.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    // const handleCheckboxChange = (event) => {
    //     const { name } = event.target;
    //     setSelectedDiscountValueType(selectedDiscountValueType === name ? null : name);
    // };

    const handleSubmit = async () => {
        try {
            // หาค่าสูงของ DocNo ใน DEPOS_H ก่อนบันทึก
            const findMaxDocNo = await getAllData('DEPOS_H', 'ORDER BY Doc_No DESC');
            const maxDoc = getMaxDocNo(findMaxDocNo, 'DS');
            let newMaxDoc = maxDoc;

            // ตรวจสอบค่า formMasterList.apID และ formMasterList.apCode
            if (!formMasterList.arID && !formMasterList.arCode) {
                getAlert("FAILED", "กรุณาเลือกลูกค้า");
                return; // หยุดการทำงานของฟังก์ชันหากไม่มีค่า apID หรือ apCode
            }

            // ตรวจสอบว่า formDetailList มีค่าหรือมีความยาวเป็น 0
            if (!formDetailList || formDetailList.length === 0) {
                getAlert("FAILED", "กรุณาเพิ่มรายละเอียดสินค้า");
                return; // หยุดการทำงานของฟังก์ชันหาก formDetailList ไม่มีค่า
            }

            // ตรวจสอบค่าภายใน formDetailList
            for (const item of formDetailList) {
                if (!item.itemQty || parseInt(item.itemQty) === 0) {
                    getAlert("FAILED", `กรุณากรอกจำนวนของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากจำนวนของสินค้าเป็น 0 หรือไม่มีค่า
                }
                if (!item.itemPriceUnit || parseInt(item.itemPriceUnit) === 0) {
                    getAlert("FAILED", `กรุณากรอกราคาต่อหน่วยของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากราคาต่อหน่วยเป็น 0 หรือไม่มีค่า
                }
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                doc_no: newMaxDoc,
                doc_date: formatStringDateToDate(formMasterList.docDate),
                doc_due_date: formatStringDateToDate(formMasterList.docDueDate),
                doc_status: parseInt("1", 10),
                doc_code: parseInt("1", 10),
                doc_type: parseInt(formMasterList.docType, 10),
                doc_for: formMasterList.docFor,
                ref_doc_id: formMasterList.refDocID,
                ref_doc: formMasterList.refDoc,
                ref_doc_date: formatStringDateToDate(formMasterList.refDocDate),
                comp_id: window.localStorage.getItem('company'),
                ref_project_id: formMasterList.refProjectID,
                ref_project_no: formMasterList.refProjectNo,
                transport_type: formMasterList.transportType,
                doc_remark1: formMasterList.docRemark1,
                doc_remark2: formMasterList.docRemark2,
                ar_id: parseInt(formMasterList.arID, 10),
                ar_code: formMasterList.arCode,
                action_hold: parseInt("0", 10),
                discount_value: parseFloat(formMasterList.discountValue || 0.00),
                discount_value_type: parseInt(selectedDiscountValueType, 10),
                discount_cash: parseFloat("0.00"),
                discount_cash_type: formMasterList.discountCashType,
                discount_transport: parseFloat("0.00"),
                discount_transport_type: formMasterList.discountTransportType,
                is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                doc_seq: formatDateTime(new Date()),
                credit_term: parseInt(formMasterList.creditTerm, 10),
                credit_term_1_day: parseInt("0", 10),
                credit_term_1_remark: formMasterList.creditTerm1Remark,
                credit_term_2_remark: formMasterList.creditTerm2Remark,
                acc_code: "0000",
                emp_name: formMasterList.empName,
                created_date: formatThaiDateUiToDate(formMasterList.createdDate),
                created_by_name: window.localStorage.getItem('name'),
                created_by_id: "1",
                update_date: formMasterList.updateDate,
                update_by_name: formMasterList.updateByName,
                update_by_id: formMasterList.updateById,
                cancel_date: formMasterList.cancelDate,
                cancel_by_name: formMasterList.cancelByName,
                cancel_by_id: formMasterList.cancelById,
                printed_status: "N",
                printed_date: formMasterList.printedDate,
                printed_by: formMasterList.printedBy,
                confirm_by_id: formMasterList.confirmById,
                confirm_date: formMasterList.confirmDate,
                confirm_by_name: formMasterList.confirmByName,
                pay_type: formMasterList.payType,
                approved_pay_date: formMasterList.approvedPayDate,
                approved_pay_by_name: formMasterList.approvedPayByName,
                approved_pay_by_id: formMasterList.approvedPayById,
                cust_name: formMasterList.custName,
                cust_tel: formMasterList.custTel,
                cust_mail: formMasterList.custMail,
                cust_confirm_memo: formMasterList.custConfirmMemo
            };

            // For Log DEPOS_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-depos-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                const getDocIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-doc-no`, {
                    table: 'DEPOS_H',
                    doc_no: formMasterData.doc_no
                }, {
                    headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                });

                // ส่งข้อมูลรายละเอียดหากพบ Doc_Id
                if (getDocIdResponse && getDocIdResponse.data.length > 0) {
                    const docId = parseInt(getDocIdResponse.data[0].Doc_Id, 10);
                    let index = 1;

                    const detailPromises = formDetailList.map(async (item) => {
                        const formDetailData = {
                            doc_id: parseInt(docId, 10),
                            line: index,
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
                        index++;

                        // For Log DEPOS_D
                        // console.log("formDetailData : ", formDetailData);

                        return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-depos-d`, formDetailData, {
                            headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                        });
                    });

                    await Promise.all(detailPromises);
                }

                callInitialize();
                getAlert(response.data.status, response.data.message);
            }
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleUpdate = async () => {
        try {
            // ตรวจสอบค่า formMasterList.apID และ formMasterList.apCode
            if (!formMasterList.arID && !formMasterList.arCode) {
                getAlert("FAILED", "กรุณาเลือกลูกค้า");
                return; // หยุดการทำงานของฟังก์ชันหากไม่มีค่า apID หรือ apCode
            }

            // ตรวจสอบว่า formDetailList มีค่าหรือมีความยาวเป็น 0
            if (!formDetailList || formDetailList.length === 0) {
                getAlert("FAILED", "กรุณาเพิ่มรายละเอียดสินค้า");
                return; // หยุดการทำงานของฟังก์ชันหาก formDetailList ไม่มีค่า
            }

            // ตรวจสอบค่าภายใน formDetailList
            for (const item of formDetailList) {
                if (!item.itemQty || parseInt(item.itemQty) === 0) {
                    getAlert("FAILED", `กรุณากรอกจำนวนของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากจำนวนของสินค้าเป็น 0 หรือไม่มีค่า
                }
                if (!item.itemPriceUnit || parseInt(item.itemPriceUnit) === 0) {
                    getAlert("FAILED", `กรุณากรอกราคาต่อหน่วยของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากราคาต่อหน่วยเป็น 0 หรือไม่มีค่า
                }
                // if (!item.whId || parseInt(item.whId) === 13) {
                //     getAlert("FAILED", `กรุณาเลือกคลังสินค้าของสินค้า ${item.itemName}`);
                //     return; // หยุดการทำงานหาก whId เป็น 13 หรือไม่มีค่า
                // }
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                doc_no: formMasterList.docNo,
                doc_date: formatStringDateToDate(formMasterList.docDate),
                doc_due_date: formatStringDateToDate(formMasterList.docDueDate),
                doc_status: parseInt(formMasterList.docStatus, 10),
                doc_code: parseInt(formMasterList.docCode, 10),
                doc_type: formMasterList.docType,
                doc_for: formMasterList.docFor,
                ref_doc_id: formMasterList.refDocID,
                ref_doc: formMasterList.refDoc,
                ref_doc_date: formatStringDateToDate(formMasterList.refDocDate),
                comp_id: formMasterList.compId,
                ref_project_id: formMasterList.refProjectID,
                ref_project_no: formMasterList.refProjectNo,
                transport_type: formMasterList.transportType,
                doc_remark1: formMasterList.docRemark1,
                doc_remark2: formMasterList.docRemark2,
                ar_id: parseInt(formMasterList.arID, 10),
                ar_code: formMasterList.arCode,
                action_hold: parseInt(formMasterList.actionHold, 10),
                discount_value: parseFloat(formMasterList.discountValue || 0.00),
                discount_value_type: parseInt(formMasterList.discountValueType, 10),
                discount_cash: parseFloat(formMasterList.discountCash),
                discount_cash_type: formMasterList.discountCashType,
                discount_transport: parseFloat(formMasterList.discountTransport),
                discount_transport_type: formMasterList.discountTransportType,
                is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                doc_seq: formMasterList.docSEQ,
                credit_term: parseInt(formMasterList.creditTerm, 10),
                credit_term_1_day: parseInt(formMasterList.creditTerm1Day, 10),
                credit_term_1_remark: formMasterList.creditTerm1Remark,
                credit_term_2_remark: formMasterList.creditTerm2Remark,
                acc_code: formMasterList.accCode,
                emp_name: formMasterList.empName,
                created_date: formatThaiDateUiToDate(formMasterList.createdDate),
                created_by_name: formMasterList.createdByName,
                created_by_id: formMasterList.createdById,
                update_date: formatThaiDateUiToDate(formMasterList.updateDate),
                update_by_name: formMasterList.updateByName,
                update_by_id: formMasterList.updateById,
                cancel_date: formatThaiDateUiToDate(formMasterList.cancelDate),
                cancel_by_name: formMasterList.cancelByName,
                cancel_by_id: formMasterList.cancelById,
                printed_status: formMasterList.printedStatus,
                printed_date: formatThaiDateUiToDate(formMasterList.printedDate),
                printed_by: formMasterList.printedBy,
                confirm_by_id: formMasterList.confirmById,
                confirm_date: formMasterList.confirmDate,
                confirm_by_name: formMasterList.confirmByName,
                pay_type: formMasterList.payType,
                approved_pay_date: formMasterList.approvedPayDate,
                approved_pay_by_name: formMasterList.approvedPayByName,
                approved_pay_by_id: formMasterList.approvedPayById,
                cust_name: formMasterList.custName,
                cust_tel: formMasterList.custTel,
                cust_mail: formMasterList.custMail,
                cust_confirm_memo: formMasterList.custConfirmMemo
            };

            // For Log DEPOS_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-depos-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {

                // ลบข้อมูลเดิมก่อนจะเริ่มการบันทึกใหม่
                await deleteDetail('DEPOS_D', `WHERE Doc_ID = ${formMasterList.docId}`);

                const docId = parseInt(formMasterList.docId, 10);
                let index = 1;

                const detailPromises = formDetailList.map(async (item) => {
                    const formDetailData = {
                        doc_id: parseInt(docId, 10),
                        line: index,
                        item_id: item.itemId,
                        item_code: item.itemCode,
                        item_name: item.itemName,
                        item_qty: item.itemQty,
                        item_unit: item.itemUnit,
                        item_price_unit: parseCurrency(item.itemPriceUnit),
                        item_discount: parseCurrency(item.itemDiscount),
                        item_distype: item.itemDisType,
                        item_total: parseCurrency(item.itemTotal),
                        item_status: parseInt(item.itemStatus, 10),
                        wh_id: parseInt(item.whId, 10),
                        zone_id: parseInt(item.zoneId, 10),
                        lt_id: parseInt(item.ltId, 10),
                        ds_seq: item.dsSeq
                    };
                    index++;

                    // For Log DEPOS_D
                    // console.log("formDetailData : ", formDetailData);

                    return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-depos-d`, formDetailData, {
                        headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                    });
                });

                await Promise.all(detailPromises);

                callInitialize();
                getAlert(response.data.status, response.data.message);
            }
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleCancel = async () => {
        try {
            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                doc_no: formMasterList.docNo,
                doc_status: parseInt("13", 10),
                cancel_date: formatThaiDateUiToDate(new Date()),
                cancel_by_name: window.localStorage.getItem('name'),
                cancel_by_id: "1",
            };

            // For Log DEPOS_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/cancel-depos-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            callInitialize();
            getAlert(response.data.status, response.data.message);
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleChangeMaster = (e) => {
        const { name, value } = e.target;
        // อัปเดตค่าใน formMasterList
        setFormMasterList((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangeDateMaster = (value, name) => {
        // ตรวจสอบว่า value เป็น moment object หรือไม่
        const newValue = value && value instanceof moment ? value.format('YYYY-MM-DD') : value;

        // อัปเดตค่าใน formMasterList
        setFormMasterList((prev) => ({
            ...prev,
            [name]: formatDateOnChange(newValue),
        }));
    };

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
        const itemDisType = String(updatedList[index].itemDisType);

        let itemTotal = itemQty * itemPriceUnit;

        if (itemDisType === '2') {
            itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
        } else {
            itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
        }

        updatedList[index].itemTotal = itemTotal;
        setFormDetailList(updatedList);
    };

    const handleFocus = (index, field) => {
        const updatedList = [...formDetailList];
        updatedList[index][field] = Number(updatedList[index][field].replace(/,/g, '')) || 0;
        setFormDetailList(updatedList);
    };

    const handleBlur = (index, field, value) => {
        const numericValue = Number(value.replace(/,/g, '')) || 0;
        const formattedValue = formatCurrency(numericValue);

        const updatedList = [...formDetailList];
        updatedList[index][field] = formattedValue;
        setFormDetailList(updatedList);
    };

    // SET AR
    const [showArModal, setShowArModal] = useState(false);
    const handleArShow = () => setShowArModal(true);
    const handleArClose = () => setShowArModal(false);
    const onRowSelectAr = (arSelected) => {
        try {
            setFormMasterList({
                ...formMasterList,
                arID: arSelected.AR_Id,
                arCode: arSelected.AR_Code,
                arName: arSelected.AR_Name,
                arAdd1: arSelected.AR_Add1,
                arAdd2: arSelected.AR_Add2,
                arAdd3: arSelected.AR_Add3,
                arProvince: arSelected.AR_Province,
                arZipcode: arSelected.AR_Zipcode,
                arTaxNo: arSelected.AR_TaxNo,

                // เพิ่มเติม (พี่แบงค์สั่งมา)
                custName: arSelected.AR_Name,
                custTel: arSelected.AR_Tel1,
                custMail: null,
            });

            handleArClose(); // ปิด modal หลังจากเลือก
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
            const newRow = deposDetailModel(formDetailList.length + 1);

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
                    itemDisType: "1",
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
    const handleVatChange = () => {
        setIsVatChecked(prev => !prev);
    };

    // การคำนวณยอดรวม (totalPrice)
    useEffect(() => {
        const total = formDetailList.reduce((acc, item) => acc + (Number(item.itemTotal) || 0), 0);
        setTotalPrice(total);
    }, [formDetailList]);

    // การคำนวณส่วนลด (receiptDiscount)
    useEffect(() => {
        let discountValue = Number(formMasterList.discountValue || 0);
        let receiptDiscount = 0;

        if (selectedDiscountValueType === '2') { // เปอร์เซ็นต์
            receiptDiscount = (totalPrice / 100) * discountValue;
        } else if (selectedDiscountValueType === '1') { // จำนวนเงิน
            receiptDiscount = discountValue;
        }

        setReceiptDiscount(receiptDiscount);
    }, [totalPrice, formMasterList.discountValue, selectedDiscountValueType]);

    // การคำนวณยอดหลังหักส่วนลด (subFinal)
    useEffect(() => {
        const subFinal = totalPrice - receiptDiscount;
        setSubFinal(subFinal);
    }, [totalPrice, receiptDiscount]);

    // การคำนวณ VAT (vatAmount)
    useEffect(() => {
        const vat = isVatChecked ? subFinal * 0.07 : 0;
        setVatAmount(vat);
    }, [subFinal, isVatChecked]);

    // การคำนวณยอดรวมทั้งสิ้น (grandTotal)
    useEffect(() => {
        const grandTotal = subFinal + vatAmount;
        setGrandTotal(grandTotal);
    }, [subFinal, vatAmount]);

    return (
        <>
            <Breadcrumbs page={maxDocNo}
                items={[
                    { name: 'จัดซื้อสินค้า', url: '/purchase' },
                    { name: name, url: '/deposit-document' },
                    { name: mode === 'U' ? "เรียกดู" + name : "สร้าง" + name, url: '#' },
                ]}
            />
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสาร</label>
                        <Datetime
                            className="input-spacing-input-date"
                            name="docDate"
                            value={formMasterList.docDate || null}
                            onChange={(date) => handleChangeDateMaster(date, 'docDate')}
                            dateFormat="DD-MM-YYYY"
                            timeFormat={false}
                            inputProps={{ readOnly: true, disabled: mode === 'U' }}
                        />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label>ลูกค้า</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control input-spacing"
                                name="apCode"
                                value={
                                    (formMasterList.arCode || '')
                                    + " " +
                                    (formMasterList.arName || '')
                                }
                                onChange={handleChangeMaster}
                                disabled={true}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleArShow}
                                disabled={formMasterList.docStatus === 1 ? false : true}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <ArModal
                        showArModal={showArModal}
                        handleArClose={handleArClose}
                        arDataList={arDataList}
                        onRowSelectAr={onRowSelectAr}
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
                            value={formMasterList.createdDate}
                            // onChange={handleChangeMaster}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>อ้างอิงเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="refDoc"
                            value={formMasterList.refDoc || ''}
                            onChange={handleChangeMaster} />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label>ที่อยู่</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="apAdd1"
                            value={formMasterList.arAdd1 || ''}
                            onChange={handleChangeMaster}
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
                            value={formMasterList.createdByName || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสารอ้างอิง</label>
                        <Datetime
                            className="input-spacing-input-date"
                            name="docDueDate"
                            value={formMasterList.refDocDate || null}
                            onChange={(date) => handleChangeDateMaster(date, 'refDocDate')}
                            dateFormat="DD-MM-YYYY"
                            timeFormat={false}
                            inputProps={{ readOnly: true, disabled: formMasterList.docStatus === 1 ? false : true }}
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
                                (formMasterList.arAdd2 || '')
                                + " " +
                                (formMasterList.arAdd3 || '')
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
                            value={formMasterList.updateDate || ''}
                            onChange={handleChangeMaster}
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
                            value={formMasterList.docType}
                            onChange={handleChangeMaster}
                            disabled={formMasterList.docStatus !== 1}
                        >
                            {tbDocType.map((docType) => (
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
                                (formMasterList.arProvince || '')
                                + " " +
                                (formMasterList.arZipcode || '')
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
                            value={formMasterList.updateByName || ''}
                            onChange={handleChangeMaster}
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
                            onChange={handleChangeMaster}
                            className="form-select form-control input-spacing"
                            disabled={formMasterList.docStatus !== 1}>
                            <option value="1">ซื้อมาเพื่อใช้</option>
                            <option value="2">ซื้อมาเพื่อขาย</option>
                        </select>
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label></label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            value={formMasterList.arTaxNo || ''}
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
                            name="approvedPayDate"
                            value={formMasterList.approvedPayDate || ''}
                            onChange={handleChangeMaster}
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
                            name="docDueDate"
                            value={formMasterList.docDueDate || null}
                            onChange={(date) => handleChangeDateMaster(date, 'docDueDate')}
                            dateFormat="DD-MM-YYYY"
                            timeFormat={false}
                            inputProps={{ readOnly: true, disabled: formMasterList.docStatus === 1 ? false : true }}
                        />
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
                            value={formMasterList.approvedPayByName || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วิธีจัดส่ง</label>
                        <select
                            name="transportType"
                            value={formMasterList.transportType}
                            onChange={handleChangeMaster}
                            className="form-select form-control input-spacing"
                            disabled={formMasterList.docStatus !== 1}
                        >
                            {tbTransType.map((transType) => (
                                <option key={transType.Trans_TypeID} value={transType.Trans_TypeID}>
                                    {transType.Trans_TypeName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-6" />
                <div className="col-3 text-right">
                    <div className="d-flex align-items-center">
                        <label>หมายเหตุอนุมัติ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            // name="approvedMemo"
                            // value={formMasterList.approvedMemo || ''}
                            // onChange={handleChangeMaster}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <hr />
            <div className="row mt-2">
                <div className="col-6">
                    <div className="d-flex align-items-center">
                        <label>รายละเอียดเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="docRemark1"
                            value={formMasterList.docRemark1 || ''}
                            onChange={handleChangeMaster}
                            maxLength={100}
                            disabled={formMasterList.docStatus !== 1} />
                    </div>
                </div>
                <div className="col-6">
                    <div className="d-flex align-items-center">
                        <label>หมายเหตุธุรการ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="docRemark2"
                            value={formMasterList.docRemark2 || ''}
                            onChange={handleChangeMaster}
                            maxLength={500}
                            disabled={formMasterList.docStatus !== 1} />
                    </div>
                </div>
            </div>
            <div className="row mt-2">
                <ItemTable
                    formDetailList={formDetailList}
                    handleChangeDetail={handleChangeDetail}
                    handleRemoveRow={handleRemoveRow}
                    formatCurrency={formatCurrency}
                    showItemModal={showItemModal}
                    handleItemClose={handleItemClose}
                    itemDataList={itemDataList}
                    onRowSelectItem={onRowSelectItem}
                    handleItemShow={handleItemShow}
                    whDataList={whDataList}
                    handleFocus={handleFocus}
                    handleBlur={handleBlur}
                    disabled={formMasterList.docStatus === 1 ? false : true}
                />
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-4" />
                                <div className="col-4" />
                                <div className="col-4">
                                    <div hidden={false}>
                                        <h5 className="text-end mb-3">ยอดท้ายบิล</h5>
                                        <div className="row mt-3">
                                            <div className="col-12">
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
                <FormAction
                    onSubmit={handleSubmit}
                    onUpdate={handleUpdate}
                    onCancel={handleCancel}
                    mode={mode}
                    disabled={formMasterList.docStatus === 1 ? false : true}
                />
            </div>
            <br />
        </>
    );
}

export default Form;
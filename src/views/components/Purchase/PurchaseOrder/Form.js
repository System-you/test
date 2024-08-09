import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// React DateTime
import Datetime from 'react-datetime';
import moment from 'moment';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import PrModal from '../../Modal/PrModal';
import ApModal from '../../Modal/ApModal';
import ItemTable from '../../Content/ItemTable';
import Summary from '../../Footer/Summary';
import FormAction from '../../Actions/FormAction';

// Model
import { poMasterModel } from '../../../../model/Purchase/PoMasterModel';
import { poDetailModel } from '../../../../model/Purchase/PoDetailModel';

// Utils
import {
    getAllData,
    getByDocId,
    getDocType,
    getTransType,
    getViewPrH,
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
    getLineByDocId,
    getCreateDateTime,
    setCreateDateTime,
    updateStatusByNo,
    updateQty,
    deleteDetail
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxDocNo }) {
    const [formMasterList, setFormMasterList] = useState(poMasterModel());
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [prDataList, setPrDataList] = useState([]);
    const [apDataList, setApDataList] = useState([]);
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

    // สำหรับส่งไปหน้า FormAction
    const [docStatus, setDocStatus] = useState(null);

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

            const prDataList = await getViewPrH();
            if (prDataList && prDataList.length > 0) {
                const filteredList = prDataList.filter(item => item.Doc_Is_PO !== 1);
                setPrDataList(filteredList);
            }

            const apDataList = await getViewAp();
            if (apDataList && apDataList.length > 0) {
                setApDataList(apDataList);
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
                await getModelByNo(apDataList);
            }
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const getModelByNo = async (apDataList) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับใน AP_ID ใน apDataList
            const [findMaster] = await Promise.all([
                getAllData('PO_H', ''),
            ]);
            const fromDatabase = findMaster.find(po => po.Doc_No === maxDocNo);

            // ค้นหาข้อมูลผู้ขายด้วย AP_ID
            const [fromViewAp] = await Promise.all([
                apDataList.find(ap => ap.AP_Id === fromDatabase.AP_ID)
            ]);

            // SET สถานะใช้กับ FormAction
            setDocStatus(fromDatabase.Doc_Status);

            if (!fromDatabase || !fromViewAp) {
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
                    ...poDetailModel(index + 1),
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
                    itemTotal,
                    itemRecQty: itemSelected.Item_REC_Qty,
                    itemRecBalance: itemSelected.Item_REC_Balance,
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            // ค้นหาข้อมูลของ Detail ด้วย Doc_ID
            const fromDetail = await getByDocId('PO_D', fromDatabase.Doc_Id, `AND Item_Status = 1 ORDER BY Line ASC`);

            if (fromDetail.length > 0) {
                const newFormDetails = fromDetail.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                setFormMasterList({
                    docId: fromDatabase.Doc_Id,
                    docNo: fromDatabase.Doc_No,
                    docDate: formatThaiDateUi(fromDatabase.Doc_Date || null),
                    docDueDate: formatThaiDateUi(fromDatabase.Doc_DueDate || null),
                    docStatus: fromDatabase.Doc_Status,
                    docStatusPaid: fromDatabase.Doc_Status_Paid,
                    docStatusReceive: fromDatabase.Doc_Status_Receive,
                    docCode: fromDatabase.Doc_Code,
                    docType: fromDatabase.Doc_Type,
                    docFor: fromDatabase.Doc_For,
                    docIsPrc: fromDatabase.Doc_Is_PRC,
                    refDocID: fromDatabase.Ref_DocID,
                    refDoc: fromDatabase.Ref_Doc,
                    refDocDate: formatThaiDateUi(fromDatabase.Ref_DocDate),
                    compId: fromDatabase.Comp_Id,
                    refProjectID: fromDatabase.Ref_ProjectID,
                    refProjectNo: fromDatabase.Ref_ProjectNo,
                    transportType: fromDatabase.Transport_Type,
                    docRemark1: fromDatabase.Doc_Remark1,
                    docRemark2: fromDatabase.Doc_Remark2,
                    apID: fromDatabase.AP_ID,
                    apCode: fromDatabase.AP_Code,
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
                    approvedDate: setCreateDateTime(fromDatabase.Approved_Date || null),
                    approvedByName: fromDatabase.Approved_By_Name,
                    approvedById: fromDatabase.Approved_By_Id,
                    cancelDate: setCreateDateTime(fromDatabase.Cancel_Date || null),
                    cancelByName: fromDatabase.Cancel_By_Name,
                    cancelById: fromDatabase.Cancel_By_Id,
                    approvedMemo: fromDatabase.Approved_Memo,
                    printedStatus: fromDatabase.Printed_Status,
                    printedDate: setCreateDateTime(fromDatabase.Printed_Date || null),
                    printedBy: fromDatabase.Printed_By,

                    // แสดงรายชื่อผู้ขาย
                    apName: fromViewAp.AP_Name,
                    apAdd1: fromViewAp.AP_Add1,
                    apAdd2: fromViewAp.AP_Add2,
                    apAdd3: fromViewAp.AP_Add3,
                    apProvince: fromViewAp.AP_Province,
                    apZipcode: fromViewAp.AP_Zipcode,
                    apTaxNo: fromViewAp.AP_TaxNo
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

    const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setSelectedDiscountValueType(selectedDiscountValueType === name ? null : name);
    };

    const handleSubmit = async () => {
        try {
            // หาค่าสูงของ DocNo ใน PO_H ก่อนบันทึก
            const findMaxDocNo = await getAllData('PO_H', 'ORDER BY Doc_No DESC');
            const maxDoc = getMaxDocNo(findMaxDocNo, 'PO');
            let newMaxDoc = maxDoc;

            // ตรวจสอบค่า formMasterList.apID และ formMasterList.apCode
            if (!formMasterList.apID && !formMasterList.apCode) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบผู้ขาย");
                return; // หยุดการทำงานของฟังก์ชันหากไม่มีค่า apID หรือ apCode
            }

            // ตรวจสอบว่า formDetailList มีค่าหรือมีความยาวเป็น 0
            if (!formDetailList || formDetailList.length === 0) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบรายละเอียดสินค้า");
                return; // หยุดการทำงานของฟังก์ชันหาก formDetailList ไม่มีค่า
            }

            // ตรวจสอบค่าภายใน formDetailList
            for (const item of formDetailList) {
                if (!item.itemQty || parseInt(item.itemQty) === 0) {
                    getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบจำนวนของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากจำนวนของสินค้าเป็น 0 หรือไม่มีค่า
                }
                if (!item.itemPriceUnit || parseInt(item.itemPriceUnit) === 0) {
                    getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบราคาต่อหน่วยของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากราคาต่อหน่วยเป็น 0 หรือไม่มีค่า
                }
                // if (!item.whId || parseInt(item.whId) === 13) {
                //     getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบคลังสินค้าของสินค้า ${item.itemName}`);
                //     return; // หยุดการทำงานหาก whId เป็น 13 หรือไม่มีค่า
                // }
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                doc_no: newMaxDoc,
                doc_date: formatStringDateToDate(formMasterList.docDate),
                doc_due_date: formatStringDateToDate(formMasterList.docDueDate),
                doc_status: parseInt("2", 10),
                doc_status_paid: parseInt("1", 10),
                doc_status_receive: parseInt("1", 10),
                doc_code: parseInt("2", 10),
                doc_type: parseInt(formMasterList.docType, 10),
                doc_for: formMasterList.docFor,
                doc_is_prc: "N",
                ref_doc_id: formMasterList.refDocID,
                ref_doc: formMasterList.refDoc,
                ref_doc_date: formatThaiDateUiToDate(formMasterList.refDocDate),
                comp_id: window.localStorage.getItem('company'),
                ref_project_id: formMasterList.refProjectID,
                ref_project_no: formMasterList.refProjectNo,
                transport_type: formMasterList.transportType,
                doc_remark1: formMasterList.docRemark1,
                doc_remark2: formMasterList.docRemark2,
                ap_id: parseInt(formMasterList.apID, 10),
                ap_code: formMasterList.apCode,
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
                approved_date: formMasterList.approvedDate,
                approved_by_name: formMasterList.approvedByName,
                approved_by_id: formMasterList.approvedById,
                cancel_date: formMasterList.cancelDate,
                cancel_by_name: formMasterList.cancelByName,
                cancel_by_id: formMasterList.cancelById,
                approved_memo: formMasterList.approvedMemo,
                printed_status: "N",
                printed_date: formMasterList.printedDate,
                printed_by: formMasterList.printedBy
            };

            // อัพสถานะออกใบ PO ที่ PR_H (updateStatusByNo = async (table, field, status, where))
            await updateStatusByNo(
                'PR_H',                                         // table: ชื่อตาราง
                'Doc_Is_PO',                                    // field: ชื่อฟิลด์
                parseInt("1", 10),                              // status: สถานะที่ต้องการอัพเดท
                `WHERE Doc_No = '${formMasterList.refDoc}'`     // where: เงื่อนไขในการอัพเดท
            );

            // For Log PO_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-po-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                const getDocIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-doc-no`, {
                    table: 'PO_H',
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
                            item_rec_qty: item.itemRecQty,
                            item_rec_balance: item.itemRecBalance,
                            item_status: item.itemStatus,
                            wh_id: parseInt(item.whId, 10),
                            zone_id: parseInt("1", 10),
                            lt_id: parseInt("1", 10),
                            ds_seq: formatDateTime(new Date())
                        };
                        index++;

                        // For Log PO_D
                        // console.log("formDetailData : ", formDetailData);

                        return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-po-d`, formDetailData, {
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
            if (!formMasterList.apID && !formMasterList.apCode) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบผู้ขาย");
                return; // หยุดการทำงานของฟังก์ชันหากไม่มีค่า apID หรือ apCode
            }

            // ตรวจสอบว่า formDetailList มีค่าหรือมีความยาวเป็น 0
            if (!formDetailList || formDetailList.length === 0) {
                getAlert("FAILED", "ไม่สามารถบันทึกได้เนื่องจากไม่พบรายละเอียดสินค้า");
                return; // หยุดการทำงานของฟังก์ชันหาก formDetailList ไม่มีค่า
            }

            // ตรวจสอบค่าภายใน formDetailList
            for (const item of formDetailList) {
                if (!item.itemQty || parseInt(item.itemQty) === 0) {
                    getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบจำนวนของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากจำนวนของสินค้าเป็น 0 หรือไม่มีค่า
                }
                if (!item.itemPriceUnit || parseInt(item.itemPriceUnit) === 0) {
                    getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบราคาต่อหน่วยของสินค้า ${item.itemName}`);
                    return; // หยุดการทำงานหากราคาต่อหน่วยเป็น 0 หรือไม่มีค่า
                }
                // if (!item.whId || parseInt(item.whId) === 13) {
                //     getAlert("FAILED", `ไม่สามารถบันทึกได้เนื่องจากไม่พบคลังสินค้าของสินค้า ${item.itemName}`);
                //     return; // หยุดการทำงานหาก whId เป็น 13 หรือไม่มีค่า
                // }
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                doc_no: formMasterList.docNo,
                doc_date: formatStringDateToDate(formMasterList.docDate),
                doc_due_date: formatStringDateToDate(formMasterList.docDueDate),
                doc_status: parseInt(formMasterList.docStatus, 10),
                doc_status_paid: parseInt(formMasterList.docStatusPaid, 10),
                doc_status_receive: parseInt(formMasterList.docStatusReceive, 10),
                doc_code: parseInt(formMasterList.docCode, 10),
                doc_type: parseInt(formMasterList.docType, 10),
                doc_for: formMasterList.docFor,
                doc_is_prc: formMasterList.docIsPrc,
                ref_doc_id: formMasterList.refDocID,
                ref_doc: formMasterList.refDoc,
                ref_doc_date: formatThaiDateUiToDate(formMasterList.refDocDate),
                comp_id: formMasterList.compId,
                ref_project_id: formMasterList.refProjectID,
                ref_project_no: formMasterList.refProjectNo,
                transport_type: formMasterList.transportType,
                doc_remark1: formMasterList.docRemark1,
                doc_remark2: formMasterList.docRemark2,
                ap_id: parseInt(formMasterList.apID, 10),
                ap_code: formMasterList.apCode,
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
                approved_date: formatThaiDateUiToDate(formMasterList.approvedDate),
                approved_by_name: formMasterList.approvedByName,
                approved_by_id: formMasterList.approvedById,
                cancel_date: formatThaiDateUiToDate(formMasterList.cancelDate),
                cancel_by_name: formMasterList.cancelByName,
                cancel_by_id: formMasterList.cancelById,
                approved_memo: formMasterList.approvedMemo,
                printed_status: formMasterList.printedStatus,
                printed_date: formatThaiDateUiToDate(formMasterList.printedDate),
                printed_by: formMasterList.printedBy
            };

            // For Log PO_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-po-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                // ลบข้อมูลเดิมก่อนจะเริ่มการบันทึกใหม่
                await deleteDetail('PO_D', `WHERE Doc_ID = ${formMasterList.docId}`);

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
                        item_rec_qty: item.itemRecQty,
                        item_rec_balance: item.itemRecBalance,
                        item_status: parseInt(item.itemStatus, 10),
                        wh_id: parseInt(item.whId, 10),
                        zone_id: parseInt(item.zoneId, 10),
                        lt_id: parseInt(item.ltId, 10),
                        ds_seq: item.dsSeq
                    };
                    index++;

                    // For Log PO_D
                    // console.log("formDetailData : ", formDetailData);

                    return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-po-d`, formDetailData, {
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

            // For Log PR_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/cancel-po-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            callInitialize();
            getAlert(response.data.status, response.data.message);
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleRecover = async () => {
        try {
            const prDetailList = await getByDocId("PR_D", formMasterList.refDocID, `ORDER BY Line ASC`);
            let hasRecBalance = false;

            // Loop Item
            const detailPromises = formDetailList.map(async (item) => {

                let prDetail = prDetailList.find(pr => pr.Item_Id === item.itemId);

                // => ให้เช็คจำนวนรับสินค้าแต่ละตัว กับ PR ว่าเท่ากันไหม?
                // => ถ้าไม่เท่าแสดงว่าค้างรับ 
                if (item.itemQty !== prDetail.Item_Qty) {
                    // => ให้ปรับจำนวนสินค้าตาม PR แล้วคำนวณ Balance ใหม่
                    let newItemQty = parseInt(prDetail.Item_Qty);
                    let newItemBalance = newItemQty - parseInt(item.itemRecQty);

                    // อัพเดทจำนวนที่คำนวณใหม่ (โดยการ Where ด้วย DT_Id)
                    await updateQty(
                        'PO_D',
                        `Item_Qty = ${newItemQty}, Item_Total = ${prDetail.Item_Total}, Item_REC_Balance = ${newItemBalance}`,
                        `WHERE DT_Id = ${item.dtId} AND Item_Status = 1`
                    );

                    hasRecBalance = true;
                }
            });

            await Promise.all(detailPromises);

            // DELETE PO_D เฉพาะรายการที่ค้างเก็บประวัติทั้งหมด (Where DocId & Item_Status = 0)
            await deleteDetail('PO_D', `WHERE Doc_ID = ${formMasterList.docId} AND Item_Status = 0`);

            const formMasterData = {
                doc_no: formMasterList.docNo,
                doc_status: parseInt("2", 10),
                doc_status_receive: hasRecBalance ? parseInt("2", 10) : parseInt("3", 10)
            };

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/recover-po-h`, formMasterData, {
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

    const updateStatusClosePo = async () => {
        try {
            // ปุ่ม "ปิด PO" (Business ให้ทำเหมือน Dialog ปิด PO ของใบรับ) 
            if (formMasterList.docStatusReceive === 2) {
                // หาค่า Line สูงสุด สำหรับในกรณีถ้าปิด PO แล้ว Insert (อยู่นอก Loop ได้)
                const getMaxLine = await getLineByDocId("PO_D", formMasterList.docId);
                let maxLine = parseInt(getMaxLine[0].Line, 10) + 1;

                // Loop Item
                const detailPromises = formDetailList.map(async (item) => {

                    // เงื่อนไขหาสินค้าที่รับไม่ครบ = จำนวนคงเหลือต้องไม่ = 0
                    if (Number(item.itemRecBalance) !== 0) {
                        // *************************************** UPDATE PO_D ****************************************
                        let itemRecQty = parseInt(item.itemRecQty);
                        let itemRecBalance = parseFloat("0.00");
                        let itemDiscount = parseInt(item.itemDiscount);
                        let updateItemTotal = itemRecQty * parseCurrency(item.itemPriceUnit);

                        if (item.itemDisType === 2) {
                            updateItemTotal -= (itemDiscount / 100) * updateItemTotal; // ลดตามเปอร์เซ็นต์
                        } else {
                            updateItemTotal -= itemDiscount; // ลดตามจำนวนเงิน
                        }

                        // Update PO_D
                        await updateQty(
                            'PO_D',
                            `Item_Qty = ${itemRecQty}, Item_Total = ${updateItemTotal}, Item_REC_Balance = ${itemRecBalance}`,
                            `WHERE Doc_ID = ${formMasterList.docId} AND Item_Id = ${item.itemId} AND Item_Status = 1`
                        );

                        // **************************************** INSERT PO_D ***************************************
                        const formInsert = {
                            doc_id: parseInt(formMasterList.docId, 10),
                            line: maxLine,
                            item_id: item.itemId,
                            item_code: item.itemCode,
                            item_name: item.itemName,
                            item_qty: itemRecQty,
                            item_unit: item.itemUnit,
                            item_price_unit: parseCurrency(item.itemPriceUnit),
                            item_discount: parseCurrency(item.itemDiscount),
                            item_distype: item.itemDisType === '1' ? 1 : 2,
                            item_total: parseFloat(itemRecQty * parseCurrency(item.itemPriceUnit)),
                            item_rec_qty: parseFloat("0.00"),
                            item_rec_balance: itemRecQty,
                            item_status: parseInt("0", 10),
                            wh_id: parseInt(item.whId, 10),
                            zone_id: parseInt("1", 10),
                            lt_id: parseInt("1", 10),
                            ds_seq: formatDateTime(new Date())
                        };

                        maxLine++;

                        await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-po-d`, formInsert, {
                            headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                        });
                        // *******************************************************************************
                    }

                });

                await Promise.all(detailPromises);
            }

            // อัพสถานะของ PO_H.Doc_Status และ PO_H.Doc_Status_Receive ทันที
            await updateStatusByNo(
                'PO_H',                                     // table: ชื่อตาราง
                'Doc_Status',                               // field: ชื่อฟิลด์
                4,                                          // status: สถานะที่ต้องการอัพเดท
                `WHERE Doc_Id = '${formMasterList.docId}'`  // where: เงื่อนไขในการอัพเดท
            );
            await updateStatusByNo(
                'PO_H',                                     // table: ชื่อตาราง
                'Doc_Status_Receive',                       // field: ชื่อฟิลด์
                3,                                          // status: สถานะที่ต้องการอัพเดท
                `WHERE Doc_Id = '${formMasterList.docId}'`  // where: เงื่อนไขในการอัพเดท
            );

            callInitialize();
            getAlert("OK", `ทำการปิดใบ PO เลขที่เอกสาร ${maxDocNo} สำเร็จ`);
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    // SET PR
    const [showPrModal, setShowPrModal] = useState(false);
    const handlePrShow = () => setShowPrModal(true);
    const handlePrClose = () => setShowPrModal(false);
    const onRowSelectPr = async (prSelected) => {
        try {
            // เคลียร์ค่าใน formMasterList และ formDetailList
            setFormMasterList({});
            setFormDetailList([]);

            // ค้นหาข้อมูลที่ตรงกับ prSelected.Doc_No ใน PR_H และ AP_ID ใน apDataList
            const [getAllPrH, fromViewAp] = await Promise.all([
                getAllData("API_0101_PR_H", "ORDER BY Doc_No DESC"),
                apDataList.find(ap => ap.AP_Id === prSelected.AP_ID)
            ]);

            const fromViewPrH = getAllPrH.find(pr => pr.Doc_No === prSelected.Doc_No);

            if (!fromViewPrH || !fromViewAp) {
                throw new Error("Data not found");
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
                    ...poDetailModel(index + 1),
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemUnit: itemSelected.Item_Unit,
                    itemPriceUnit,
                    itemDiscount,
                    itemDisType: String(itemSelected.Item_DisType),
                    itemTotal,
                    itemRecQty: parseInt("0", 10),
                    itemRecBalance: itemQty,
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            const getAllItem = await getAllData('API_0102_PR_D', 'ORDER BY Line ASC');
            const filterItem = getAllItem.filter(item => item.Doc_No === prSelected.Doc_No);

            if (filterItem.length > 0) {
                const newFormDetails = filterItem.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                const firstItem = filterItem[0];

                setFormMasterList({
                    ...formMasterList,
                    refDocID: prSelected.Doc_ID,
                    refDoc: prSelected.Doc_No,
                    refDocDate: formatThaiDateUi(prSelected.Doc_Date),
                    docDate: formatThaiDateUi(moment()),
                    docDueDate: formatThaiDateUi(moment()),
                    docRemark1: fromViewPrH.Doc_Remark1,
                    docRemark2: fromViewPrH.Doc_Remark2,
                    docType: fromViewPrH.Doc_Type,
                    docFor: fromViewPrH.Doc_For,
                    transportType: fromViewPrH.Transport_Type,
                    discountValue: fromViewPrH.Discount_Value,
                    creditTerm: firstItem.CreditTerm,
                    apID: fromViewPrH.AP_ID,
                    apCode: firstItem.AP_Code,
                    apName: firstItem.AP_Name,
                    apAdd1: firstItem.AP_Add1,
                    apAdd2: firstItem.AP_Add2,
                    apAdd3: firstItem.AP_Add3,
                    apProvince: firstItem.AP_Province,
                    apZipcode: firstItem.AP_Zipcode,
                    apTaxNo: firstItem.AP_TaxNo,
                    createdByName: window.localStorage.getItem('name'),
                    createdDate: getCreateDateTime(),
                    updateDate: fromViewPrH.Update_Date,
                    updateByName: fromViewPrH.Update_By_Name
                });

                setIsVatChecked(fromViewPrH.IsVat === 1 ? true : false);

                const discountValueType = Number(fromViewPrH.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }

            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${prSelected.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }

            handlePrClose(); // ปิด modal หลังจากเลือก
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    // SET AP
    const [showApModal, setShowApModal] = useState(false);
    const handleApShow = () => setShowApModal(true);
    const handleApClose = () => setShowApModal(false);
    const onRowSelectAp = (apSelected) => {
        try {
            setFormMasterList({
                ...formMasterList,
                apID: apSelected.AP_Id,
                apCode: apSelected.AP_Code,
                apName: apSelected.AP_Name,
                apAdd1: apSelected.AP_Add1,
                apAdd2: apSelected.AP_Add2,
                apAdd3: apSelected.AP_Add3,
                apProvince: apSelected.AP_Province,
                apZipcode: apSelected.AP_Zipcode,
                apTaxNo: apSelected.AP_TaxNo
            });
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
            const newRow = poDetailModel(formDetailList.length + 1);

            setFormDetailList([
                ...formDetailList,
                {
                    ...newRow,
                    line: null,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty: 0,
                    itemUnit: itemSelected.Item_Unit_IN,
                    itemPriceUnit: itemSelected.Item_Cost,
                    itemDiscount: 0,
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
            <Breadcrumbs page={maxDocNo} items={[
                { name: 'จัดซื้อสินค้า', url: '/purchase' },
                { name: name, url: '/purchase-order' },
                { name: mode === 'U' ? "เรียกดู" + name : "สร้าง" + name, url: '#' },
            ]} />
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
                        <label>ผู้ขาย</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control input-spacing"
                                name="apCode"
                                value={
                                    (formMasterList.apCode || '')
                                    + " " +
                                    (formMasterList.apName || '')
                                }
                                onChange={handleChangeMaster}
                                disabled={true}
                            />
                            <button className="btn btn-outline-secondary" onClick={handleApShow} hidden={true}>
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
                            value={formMasterList.createdDate}
                            //onChange={handleChangeMaster}
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
                                value={formMasterList.refDoc || ''}
                                onChange={handleChangeMaster}
                                disabled={true}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handlePrShow}
                                disabled={mode === 'U'}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <PrModal
                            showPrModal={showPrModal}
                            handlePrClose={handlePrClose}
                            prDataList={prDataList}
                            onRowSelectPr={onRowSelectPr}
                        />
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex align-items-center">
                        <label>ที่อยู่</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="apAdd1"
                            value={formMasterList.apAdd1 || ''}
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
                        <input
                            //type="date"
                            type="text"
                            className="form-control input-spacing"
                            name="refDocDate"
                            value={formMasterList.refDocDate || ''}
                            onChange={handleChangeMaster}
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
                                (formMasterList.apAdd2 || '')
                                + " " +
                                (formMasterList.apAdd3 || '')
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
                            disabled={true}
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
                                (formMasterList.apProvince || '')
                                + " " +
                                (formMasterList.apZipcode || '')
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
                            disabled={true}
                            className="form-select form-control input-spacing"
                        >
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
                            value={
                                formMasterList.apTaxNo || ''
                            }
                            disabled={true} />
                    </div>
                </div>
                <div className="col-2" />
                <div className="col-3 text-right">
                    {/* <div className="d-flex align-items-center">
                        <label>วันที่อนุมัติ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedDate"
                            value={formMasterList.approvedDate || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div> */}
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
                            inputProps={{ readOnly: true, disabled: false }}
                        />
                    </div>
                </div>
                <div className="col-6" />
                <div className="col-3 text-right">
                    {/* <div className="d-flex align-items-center">
                        <label>ผู้อนุมัติเอกสาร</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedByName"
                            value={formMasterList.approvedByName || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div> */}
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
                            disabled={true}
                            className="form-select form-control input-spacing"
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
                    {/* <div className="d-flex align-items-center">
                        <label>หมายเหตุอนุมัติ</label>
                        <input
                            type="text"
                            className="form-control input-spacing"
                            name="approvedMemo"
                            value={formMasterList.approvedMemo || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div> */}
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
                            maxLength={100} />
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
                            maxLength={500} />
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
                    disabled={true}
                />
                <Summary
                    formMasterList={formMasterList}
                    handleChangeMaster={handleChangeMaster}
                    selectedDiscountValueType={selectedDiscountValueType}
                    handleCheckboxChange={handleCheckboxChange}
                    receiptDiscount={receiptDiscount}
                    formatCurrency={formatCurrency}
                    totalPrice={totalPrice}
                    subFinal={subFinal}
                    isVatChecked={isVatChecked}
                    handleVatChange={handleVatChange}
                    vatAmount={vatAmount}
                    grandTotal={grandTotal}
                    disabled={true}
                />
                <FormAction
                    onSubmit={handleSubmit}
                    onUpdate={handleUpdate}
                    onCancel={handleCancel}
                    onRecover={handleRecover}
                    onClosePo={() => updateStatusClosePo()}
                    docStatus={docStatus}
                    mode={mode}
                    disabled=
                    {
                        formMasterList.docStatus === 2 &&
                            formMasterList.docStatusReceive !== 3 ? false : true
                    }
                />
            </div >
            <br />
        </>
    );
}

export default Form;
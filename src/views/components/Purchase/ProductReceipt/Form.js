import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// React DateTime
import Datetime from 'react-datetime';
import moment from 'moment';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import PoModal from '../../Modal/PoModal';
import ApModal from '../../Modal/ApModal';
import ItemTable from '../../Content/ItemTable';
import FormAction from '../../Actions/FormAction';

// Model
import { recMasterModel } from '../../../../model/Purchase/RecMasterModel';
import { recDetailModel } from '../../../../model/Purchase/RecDetailModel';

// Utils
import {
    getAllData,
    getByDocId,
    getByRecId,
    getDocType,
    getTransType,
    getViewPoH,
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
    getMaxRecNo,
    getLineByDocId,
    getCreateDateTime,
    setCreateDateTime,
    updateStatusByNo,
    updateQty,
    deleteDetail
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxRecNo }) {
    const [formMasterList, setFormMasterList] = useState(recMasterModel());
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [poDataList, setPoDataList] = useState([]);
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

    // ตัวแปรสำหรับเก็บจำนวนเดิมเอาไว้
    const [formDetailOldList, setFormDetailOldList] = useState([]);

    // Modal สำหรับ Confirm Dialog ของรับสินค้า PO
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // ตัวแปรเก็บ PO
    const [poDList, setPoDList] = useState([]);
    const [docStatusPo, setDocStatusPo] = useState(null);
    const [docStatusReceivePo, setDocStatusReceivePo] = useState(null);

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

            const poDataList = await getViewPoH();
            if (poDataList && poDataList.length > 0) {
                const filteredList = poDataList.filter(item => item.Doc_Status_ReceiveName !== "รับสินค้าครบ");
                setPoDataList(filteredList);
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
                getAllData('REC_H', ''),
            ]);
            const fromDatabase = findMaster.find(rec => rec.Rec_No === maxRecNo);

            // ค้นหาข้อมูลผู้ขายด้วย AP_ID
            const [fromViewAp] = await Promise.all([
                apDataList.find(ap => ap.AP_Id === fromDatabase.AP_ID)
            ]);

            // ค้นหาข้อมูล PO ด้วย Ref_DocID
            const formPoMaster = await getByDocId("PO_H", fromDatabase.Ref_DocID, ``);
            setDocStatusPo(formPoMaster[0].Doc_Status);
            setDocStatusReceivePo(formPoMaster[0].Doc_Status_Receive);

            if (!fromDatabase || !fromViewAp) {
                throw new Error("Data not found");
            };

            // ค้นหาข้อมูลที่ตรงกับใน PO_H และ AP_ID ใน apDataList
            // ***************************** refDocID = NULL ตอน onRowSelect ***********************
            const [detailResponse] = await Promise.all([
                getAllData('API_0202_PO_D', `AND Item_Status = 1 AND Doc_ID = ${fromDatabase.Ref_DocID}`),
            ]);

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

                // ตรวจสอบว่า detailResponse มีข้อมูลหรือไม่
                let itemQtyNow = 0;
                let itemRecQty = 0;
                if (detailResponse && detailResponse.length > 0) {
                    const detail = detailResponse.find(item => item.Item_Id === itemSelected.Item_Id);
                    if (detail && detail.Item_Qty && detail.Item_REC_Qty !== undefined) {
                        itemQtyNow = detail.Item_Qty;
                        itemRecQty = detail.Item_REC_Qty;
                    }
                }

                return {
                    ...recDetailModel(index + 1),
                    dtId: itemSelected.DT_Id,
                    recId: itemSelected.Rec_ID,
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
                    itemRecBalance: Number(itemQtyNow - itemRecQty),
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            // ค้นหาข้อมูลของ Detail ด้วย Rec_ID
            const fromDetail = await getByRecId('REC_D', fromDatabase.Rec_Id, `ORDER BY Line ASC`);

            // ค้นหาข้อมูลของ Detail ของ PO ด้วย Doc_ID
            const formPoList = await getByDocId("PO_D", fromDatabase.Ref_DocID, `ORDER BY Line ASC`);
            setPoDList(formPoList);

            if (fromDetail.length > 0) {
                const newFormDetails = fromDetail.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                setFormDetailOldList(newFormDetails);

                createNewRow(formDetailList.length + 0, 100);

                setFormMasterList({
                    recId: fromDatabase.Rec_Id,
                    recNo: fromDatabase.Rec_No,
                    recDate: formatThaiDateUi(fromDatabase.Rec_Date || null),
                    recDueDate: formatThaiDateUi(fromDatabase.Rec_DueDate || null),
                    recStatus: fromDatabase.Rec_Status,
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

                const discountValueType = Number(fromViewAp.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${fromDatabase.Rec_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    const handleSubmit = async (status) => {
        try {
            setShowConfirmModal(false);

            // หาค่าสูงของ RecNo ใน REC_H ก่อนบันทึก
            const findMaxRecNo = await getAllData('REC_H', 'ORDER BY Rec_No DESC');
            const maxRec = getMaxRecNo(findMaxRecNo);
            let newMaxRec = maxRec;

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
                rec_no: newMaxRec,
                rec_date: formatStringDateToDate(formMasterList.recDate),
                rec_due_date: formatStringDateToDate(formMasterList.recDueDate),
                rec_status: parseInt("2", 10),
                doc_code: parseInt("3", 10),
                doc_type: parseInt(formMasterList.docType, 10),
                doc_for: formMasterList.docFor,
                ref_doc_id: formMasterList.refDocID,
                ref_doc: formMasterList.refDoc,
                ref_doc_date: formatThaiDateUiToDate(formMasterList.refDocDate),
                ref_project_id: formMasterList.refProjectID,
                ref_project_no: formMasterList.refProjectNo,
                comp_id: window.localStorage.getItem('company'),
                transport_type: formMasterList.transportType,
                doc_remark1: formMasterList.docRemark1,
                doc_remark2: formMasterList.docRemark2,
                ap_id: parseInt(formMasterList.apID, 10),
                ap_code: formMasterList.apCode,
                action_hold: parseInt("0", 10),
                // discount_value: parseFloat(formMasterList.discountValue || 0.00),
                discount_value: parseFloat(0.00),
                discount_value_type: parseInt(selectedDiscountValueType, 10),
                discount_cash: parseFloat("0.00"),
                discount_cash_type: formMasterList.discountCashType,
                discount_transport: parseFloat("0.00"),
                discount_transport_type: formMasterList.discountTransportType,
                // is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                is_vat: parseInt("2", 10),
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

            // อัพสถานะรับสินค้าที่ PO_H (updateStatusByNo = async (table, field, status, where))
            await updateStatusByNo(
                'PO_H',                                         // table: ชื่อตาราง
                'Doc_Status_Receive',                           // field: ชื่อฟิลด์
                status,                                         // status: สถานะที่ต้องการอัพเดท
                `WHERE Doc_No = '${formMasterList.refDoc}'`     // where: เงื่อนไขในการอัพเดท
            );

            // For Log PO_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-rec-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                // กรองรายการที่มี ItemQty มากกว่า 0
                const validDetails = formDetailList.filter(item => Number(item.itemQty) !== 0);

                if (validDetails.length > 0) {
                    const getRecIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-rec-no`, {
                        table: 'REC_H',
                        rec_no: formMasterData.rec_no
                    }, {
                        headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                    });

                    if (getRecIdResponse && getRecIdResponse.data.length > 0) {
                        const recId = parseInt(getRecIdResponse.data[0].Rec_Id, 10);
                        let lineIndex = 1;

                        // หาค่า Line สูงสุด สำหรับในกรณีถ้าปิด PO แล้ว Insert
                        const getMaxLine = await getLineByDocId("PO_D", formMasterList.refDocID);
                        let maxLine = parseInt(getMaxLine[0].Line, 10) + 1;

                        const detailPromises = validDetails.map(async (item) => {
                            const formDetailData = {
                                rec_id: recId,
                                line: lineIndex,
                                item_id: item.itemId,
                                item_code: item.itemCode,
                                item_name: item.itemName,
                                item_qty: item.itemQty,
                                item_unit: item.itemUnit,
                                item_price_unit: parseCurrency(item.itemPriceUnit),
                                item_discount: parseCurrency(item.itemDiscount),
                                item_distype: item.itemDisType === '1' ? 1 : 2,
                                item_total: item.itemTotal,
                                item_status: item.itemStatus,
                                wh_id: parseInt(item.whId, 10),
                                zone_id: parseInt("1", 10),
                                lt_id: parseInt("1", 10),
                                ds_seq: formatDateTime(new Date())
                            };

                            const detailResponse = await getByDocId("PO_D", formMasterList.refDocID, `AND Item_Id = ${item.itemId}`);

                            // if (ปิด PO && ค้างรับมีค่ามากกว่า 0 )
                            if (status === 3 && detailResponse[0].Item_REC_Balance > 0) {
                                // REC_D มาจากค่าที่รับจากหน้าจอ
                                const itemQtyRec = parseFloat(item.itemQty);

                                let insertItemTotal = (detailResponse[0].Item_REC_Balance - itemQtyRec) * detailResponse[0].Item_Price_Unit;

                                if (detailResponse[0].Item_DisType === 2) {
                                    insertItemTotal -= (detailResponse[0].Item_Discount / 100) * insertItemTotal; // ลดตามเปอร์เซ็นต์
                                } else {
                                    insertItemTotal -= detailResponse[0].Item_Discount; // ลดตามจำนวนเงิน
                                }

                                // Form Insert PO_D
                                const formInsert = {
                                    doc_id: parseInt(detailResponse[0].Doc_ID, 10),
                                    line: maxLine,
                                    item_id: item.itemId,
                                    item_code: item.itemCode,
                                    item_name: item.itemName,
                                    item_qty: detailResponse[0].Item_REC_Balance - itemQtyRec,
                                    item_unit: item.itemUnit,
                                    item_price_unit: parseCurrency(item.itemPriceUnit),
                                    item_discount: parseCurrency(item.itemDiscount),
                                    item_distype: item.itemDisType === '1' ? 1 : 2,
                                    item_total: parseFloat(insertItemTotal),
                                    item_rec_qty: parseFloat("0.00"),
                                    item_rec_balance: detailResponse[0].Item_REC_Balance - itemQtyRec,
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

                                // คำนวณค่าต่าง ๆ
                                // มาจาก Table PO_D 
                                const itemQty = detailResponse[0].Item_REC_Qty + itemQtyRec; // 0 + 3 = 3
                                const itemRecQty = detailResponse[0].Item_REC_Qty + itemQtyRec; // 0 + 3 = 3
                                const itemRecBalance = parseFloat("0.00");

                                let updateItemTotal = itemQty * detailResponse[0].Item_Price_Unit;

                                if (detailResponse[0].Item_DisType === 2) {
                                    updateItemTotal -= (detailResponse[0].Item_Discount / 100) * updateItemTotal; // ลดตามเปอร์เซ็นต์
                                } else {
                                    updateItemTotal -= detailResponse[0].Item_Discount; // ลดตามจำนวนเงิน
                                }

                                // Update PO_D คีบอร์ด จำนวน 3 รับ 3 ค้าง 0
                                await updateQty(
                                    'PO_D',
                                    `Item_Qty = ${itemQty}, Item_REC_Qty = ${itemRecQty}, Item_Total = ${updateItemTotal}, Item_REC_Balance = ${itemRecBalance}`,
                                    `WHERE Doc_ID = ${formMasterList.refDocID} AND Item_Id = ${item.itemId} AND Item_Status = 1`
                                );
                            } else {
                                // คำนวณค่าต่าง ๆ
                                const itemQty = parseFloat(item.itemQty);
                                const itemRecQty = detailResponse[0].Item_REC_Qty + itemQty;
                                const itemRecBalance = detailResponse[0].Item_REC_Balance - itemQty;

                                // ลบจำนวนสินค้าที่ PO_D จำนวนรับ และ จำนวนค้างรับ (updateQty = async (table, updateCode, where))
                                await updateQty(
                                    'PO_D',
                                    `Item_REC_Qty = ${itemRecQty}, Item_REC_Balance = ${itemRecBalance}`,
                                    `WHERE Doc_ID = ${formMasterList.refDocID} AND Item_Id = ${item.itemId} AND Item_Status = 1`
                                );
                            }

                            lineIndex++;

                            // For Log PO_D
                            // console.log("formDetailData : ", formDetailData);

                            return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-rec-d`, formDetailData, {
                                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                            });
                        });

                        await Promise.all(detailPromises);

                        await updateStatusPo(status, formMasterList.refDocID);

                        // ดึงข้อมูลทั้งหมดที่ตรงกับ Doc_ID ที่ระบุ
                        // const detailResponse = await getByDocId("PO_D", formMasterList.refDocID, `ORDER BY Line ASC`);

                        // validDetails.forEach(async (item, index) => {
                        //     let line = index + 1;

                        //     // กรองข้อมูลตาม line ที่ต้องการ
                        //     let details = detailResponse.filter(detail => detail.Line === line);

                        //     if (details.length > 0 && details[0].Item_REC_Qty !== undefined) {
                        //         // คำนวณค่าต่าง ๆ
                        //         const itemQty = parseFloat(item.itemQty);
                        //         const itemRecQty = parseFloat(details[0].Item_REC_Qty) + itemQty;
                        //         const itemRecBalance = parseFloat(details[0].Item_REC_Balance) - itemQty;

                        //         // ลบจำนวนสินค้าที่ PO_D จำนวนรับ และ จำนวนค้างรับ (updateQty = async (table, updateCode, where))
                        //         await updateQty(
                        //             'PO_D',
                        //             `Item_REC_Qty = ${itemRecQty}, Item_REC_Balance = ${itemRecBalance}`,
                        //             `WHERE Doc_ID = ${formMasterList.refDocID} AND Line = ${line}`
                        //         );
                        //     }
                        // });
                    }
                }

                callInitialize();
                getAlert(response.data.status, response.data.message);
            }
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleUpdate = async (status) => {
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
                rec_no: formMasterList.recNo,
                rec_date: formatStringDateToDate(formMasterList.recDate),
                rec_due_date: formatStringDateToDate(formMasterList.recDueDate),
                rec_status: parseInt(formMasterList.recStatus, 10),
                doc_code: parseInt(formMasterList.docCode, 10),
                doc_type: parseInt(formMasterList.docType, 10),
                doc_for: formMasterList.docFor,
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
                //discount_value: parseFloat(formMasterList.discountValue || 0.00),
                discount_value: parseFloat(0.00),
                discount_value_type: parseInt(selectedDiscountValueType, 10),
                discount_cash: parseFloat(formMasterList.discountCash),
                discount_cash_type: formMasterList.discountCashType,
                discount_transport: parseFloat(formMasterList.discountTransport),
                discount_transport_type: formMasterList.discountTransportType,
                // is_vat: isVatChecked ? parseInt("1", 10) : parseInt("2", 10),
                is_vat: parseInt("2", 10),
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
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-rec-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            //  *****************************************
            // const validDetails = formDetailList.filter(item => Number(item.itemQty) !== 0);
            // if (validDetails.length > 0) {
            //     const detailPromises = validDetails.map(async (item, index) => {
            //         // Find REC
            //         let recDetail = await getByRecId("REC_D", formMasterList.recId, `AND Item_Id = ${item.itemId}`);
            //         // console.debug("Find REC ===>", recDetail);

            //         // Find PO
            //         let detailResponse = await getByDocId("PO_D", formMasterList.refDocID, `AND Item_Id = ${item.itemId}`);
            //         // console.debug("Find PO ===>", detailResponse);

            //         if (recDetail.length > 0 && detailResponse.length > 0) {
            //             const recItem = recDetail.find(rec => rec.Item_Id === item.itemId);
            //             const poItem = detailResponse.find(po => po.Item_Id === item.itemId);
            //             // console.debug("recItem ===>", recItem);
            //             // console.debug("poItem ===>", poItem);

            //             if (recItem && poItem) {
            //                 const itemQty = parseFloat(item.itemQty); // ค่าใหม่มาจากหน้าจอ
            //                 const itemRecQty = poItem.Item_REC_Qty - recItem.Item_Qty + itemQty;
            //                 const itemRecBalance = poItem.Item_REC_Balance + recItem.Item_Qty - itemQty;

            //                 console.debug("ค่าใหม่มาจากหน้าจอ ===> ", itemQty);
            //                 console.debug("itemRecQty ===> ", itemRecQty);
            //                 console.debug("itemRecBalance ===> ", itemRecBalance);
            //             } else {
            //                 console.error("Item_Id ไม่ตรงกันระหว่าง REC และ PO");
            //             }
            //         } else {
            //             console.error("ไม่พบข้อมูล REC หรือ PO สำหรับ Item_Id นี้");
            //         }
            //     });
            // }
            //  *****************************************

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                // กรองรายการที่มี ItemQty มากกว่า 0
                const validDetails = formDetailList.filter(item => Number(item.itemQty) !== 0);

                if (validDetails.length > 0) {
                    const recId = parseInt(formMasterList.recId, 10);
                    let lineIndex = 1;

                    // หาค่า Line สูงสุด สำหรับในกรณีถ้าปิด PO แล้ว Insert
                    // const getMaxLine = await getLineByDocId("PO_D", formMasterList.refDocID);
                    // let maxLine = parseInt(getMaxLine[0].Line, 10) + 1;

                    const detailPromises = validDetails.map(async (item) => {

                        const formDetailData = {
                            rec_id: recId,
                            line: lineIndex,
                            item_id: item.itemId,
                            item_code: item.itemCode,
                            item_name: item.itemName,
                            item_qty: item.itemQty,
                            item_unit: item.itemUnit,
                            item_price_unit: parseCurrency(item.itemPriceUnit),
                            item_discount: parseCurrency(item.itemDiscount),
                            item_distype: item.itemDisType === '1' ? 1 : 2,
                            item_total: item.itemTotal,
                            item_status: item.itemStatus,
                            wh_id: parseInt(item.whId, 10),
                            zone_id: parseInt(item.zoneId, 10),
                            lt_id: parseInt(item.ltId, 10),
                            ds_seq: item.dsSeq
                        };

                        // Find REC
                        let recDetail = await getByRecId("REC_D", formMasterList.recId, `AND Item_Id = ${item.itemId}`);

                        // Find PO
                        let detailResponse = await getByDocId("PO_D", formMasterList.refDocID, `AND Item_Id = ${item.itemId}`);

                        // if (ปิด PO && ค้างมีค่ามากกว่า 0 )
                        //if (status === 3 && detailResponse[0].Item_REC_Balance > 0) {
                        // // REC_D มาจากค่าที่รับจากหน้าจอ
                        // const itemQtyRec = parseFloat(item.itemQty);

                        // let insertItemTotal = (detailResponse[0].Item_REC_Balance - itemQtyRec) * detailResponse[0].Item_Price_Unit;

                        // if (detailResponse[0].Item_DisType === 2) {
                        //     insertItemTotal -= (detailResponse[0].Item_Discount / 100) * insertItemTotal; // ลดตามเปอร์เซ็นต์
                        // } else {
                        //     insertItemTotal -= detailResponse[0].Item_Discount; // ลดตามจำนวนเงิน
                        // }

                        // // Form Insert PO_D
                        // const formInsert = {
                        //     doc_id: parseInt(detailResponse[0].Doc_ID, 10),
                        //     line: maxLine,
                        //     item_id: item.itemId,
                        //     item_code: item.itemCode,
                        //     item_name: item.itemName,
                        //     item_qty: detailResponse[0].Item_REC_Balance - itemQtyRec,
                        //     item_unit: item.itemUnit,
                        //     item_price_unit: parseCurrency(item.itemPriceUnit),
                        //     item_discount: parseCurrency(item.itemDiscount),
                        //     item_distype: item.itemDisType === '1' ? 1 : 2,
                        //     item_total: parseFloat(insertItemTotal),
                        //     item_rec_qty: parseFloat("0.00"),
                        //     item_rec_balance: detailResponse[0].Item_REC_Balance - itemQtyRec,
                        //     item_status: parseInt("0", 10),
                        //     wh_id: parseInt(item.whId, 10),
                        //     zone_id: parseInt("1", 10),
                        //     lt_id: parseInt("1", 10),
                        //     ds_seq: formatDateTime(new Date())
                        // };

                        // maxLine++;

                        // await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-po-d`, formInsert, {
                        //     headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                        // });

                        // // คำนวณค่าต่าง ๆ
                        // // มาจาก Table PO_D 
                        // const itemQty = detailResponse[0].Item_REC_Qty + itemQtyRec; // 0 + 3 = 3
                        // const itemRecQty = detailResponse[0].Item_REC_Qty + itemQtyRec; // 0 + 3 = 3
                        // const itemRecBalance = parseFloat("0.00");

                        // let updateItemTotal = itemQty * detailResponse[0].Item_Price_Unit;

                        // if (detailResponse[0].Item_DisType === 2) {
                        //     updateItemTotal -= (detailResponse[0].Item_Discount / 100) * updateItemTotal; // ลดตามเปอร์เซ็นต์
                        // } else {
                        //     updateItemTotal -= detailResponse[0].Item_Discount; // ลดตามจำนวนเงิน
                        // }

                        // // Update PO_D คีบอร์ด จำนวน 3 รับ 3 ค้าง 0
                        // await updateQty(
                        //     'PO_D',
                        //     `Item_Qty = ${itemQty}, Item_REC_Qty = ${itemRecQty}, Item_Total = ${updateItemTotal}, Item_REC_Balance = ${itemRecBalance}`,
                        //     `WHERE Doc_ID = ${formMasterList.refDocID} AND Item_Id = ${item.itemId} AND Item_Status = 1`
                        // );
                        //} else {
                        // คำนวณค่าต่าง ๆ
                        if (recDetail.length > 0 && detailResponse.length > 0) {
                            const recItem = recDetail.find(rec => rec.Item_Id === item.itemId);
                            const poItem = detailResponse.find(po => po.Item_Id === item.itemId);

                            // ลบจำนวนสินค้าที่ PO_D จำนวนรับ และ จำนวนค้างรับ (updateQty = async (table, updateCode, where))
                            if (recItem && poItem) {
                                let itemQty = parseFloat(item.itemQty); // ค่าใหม่มาจากหน้าจอ
                                let itemRecQty = poItem.Item_REC_Qty - recItem.Item_Qty + itemQty;
                                let itemRecBalance = poItem.Item_REC_Balance + recItem.Item_Qty - itemQty;

                                await updateQty(
                                    'PO_D',
                                    `Item_REC_Qty = ${itemRecQty}, Item_REC_Balance = ${itemRecBalance}`,
                                    `WHERE Doc_ID = ${formMasterList.refDocID} AND Item_Id = ${item.itemId} AND Item_Status = 1`
                                );
                            } else {
                                console.error("Item_Id ไม่ตรงกันระหว่าง REC และ PO");
                            }
                        } else {
                            console.error("ไม่พบข้อมูล REC หรือ PO สำหรับ Item_Id นี้");
                        }
                        //}

                        lineIndex++;

                        // DELETE REC_D เฉพาะรายการเดียว
                        await deleteDetail('REC_D', `WHERE DT_Id = ${item.dtId}`);

                        // INSERT REC_D
                        return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-rec-d`, formDetailData, {
                            headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                        });
                    });

                    await Promise.all(detailPromises);

                    await updateStatusPo(status, formMasterList.refDocID);

                    callInitialize();
                    getAlert(response.data.status, response.data.message);
                }
            }
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const handleCancel = async () => {
        try {
            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                rec_no: formMasterList.recNo,
                rec_status: parseInt("13", 10),
                cancel_date: formatThaiDateUiToDate(new Date()),
                cancel_by_name: window.localStorage.getItem('name'),
                cancel_by_id: "1",
            };

            // For Log PR_H
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/cancel-rec-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            callInitialize();
            getAlert(response.data.status, response.data.message);
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    const updateStatusPo = async (status, docId) => {
        try {
            // Find PO
            const poDetailList = await getByDocId("PO_D", docId, `ORDER BY Line ASC`);

            // เช็กเงื่อนไขเพิ่มว่า ถ้า PO.Item_REC_Balance = 0 ทุกรายการ ให้ UPDATE PO_H.Doc_Status เป็น "ปิด PO"
            if (status === 3 && poDetailList.every(item => item.Item_REC_Balance === 0)) {

                // อัพสถานะของ PO_H เมื่อรับสินค้าครบ และ จำนวนคงเหลือเป็น 0 ทั้งหมด
                return await updateStatusByNo(
                    'PO_H',                                        // table: ชื่อตาราง
                    'Doc_Status',                                  // field: ชื่อฟิลด์
                    4,                                             // status: สถานะที่ต้องการอัพเดท
                    `WHERE Doc_Id = '${docId}'`    // where: เงื่อนไขในการอัพเดท
                );

            }
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

        const oldList = [...formDetailOldList];
        const poD = [...poDList];

        let poItemQty = 0;

        if (mode === 'U') {
            poItemQty = poD[index].Item_Qty;
        } else {
            poItemQty = oldList[index][field];
        }

        if (field === 'itemQty' && parseInt(value, 10) > parseInt(poItemQty, 10)) {
            const updatedList = [...formDetailList];
            if (mode === 'U') {
                updatedList[index][field] = poD[index].Item_REC_Qty;
            } else {
                updatedList[index][field] = updatedList[index].itemRecBalance;
            }
            setFormDetailList(updatedList);
            getAlert("FAILED", "ไม่สามารถรับสินค้าเกินกว่ายอด PO ได้");
        } else if (field === 'itemQty' && parseInt(value, 10) < oldList[index][field]) {
            // setShowConfirmModal(true);
            updateFormDetailList(index, field, value);
        } else {
            updateFormDetailList(index, field, value);
        }
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

    const handleConfirmtModal = () => {
        let shouldShowModal = false;

        formDetailList.forEach((item) => {
            // แปลงค่าของ item.itemQty และ item.itemRecBalance เป็นตัวเลข
            const itemQty = Number(item.itemQty);
            const itemRecBalance = Number(item.itemRecBalance);

            if (itemQty !== itemRecBalance) {
                shouldShowModal = true;
            }
        });

        if (shouldShowModal) {
            if (mode === 'U') {
                // ไม่ให้โหมดแก้ไข เลือกปิด PO ได้
                handleUpdate(parseInt("2", 10));
            } else {
                setShowConfirmModal(true);
            }
        } else {
            if (mode === 'U') {
                handleUpdate(parseInt("3", 10));
            } else {
                handleSubmit(parseInt("3", 10));
            }
        }
    };

    const updateFormDetailList = (index, field, value) => {
        // แปลงค่าที่กรอกเป็นจำนวนเงิน
        const numericValue = Number(value) || 0;

        const updatedList = [...formDetailList];
        updatedList[index][field] = numericValue;

        const itemQty = Number(updatedList[index].itemQty) || 0;
        const itemPriceUnit = parseCurrency(updatedList[index].itemPriceUnit) || 0;
        const itemDiscount = Number(updatedList[index].itemDiscount) || 0;
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

    // SET PO
    const [showPoModal, setShowPoModal] = useState(false);
    const handlePoShow = () => setShowPoModal(true);
    const handlePoClose = () => setShowPoModal(false);
    const onRowSelectPo = async (poSelected) => {
        try {
            // เคลียร์ค่าใน formMasterList และ formDetailList
            setFormMasterList({});
            setFormDetailList([]);

            // ค้นหาข้อมูลที่ตรงกับ poSelected.Doc_No ใน PR_H และ AP_ID ใน apDataList
            const [getAllPoH, fromViewAp] = await Promise.all([
                getAllData('API_0201_PO_H', 'ORDER BY Doc_No DESC'),
                apDataList.find(ap => ap.AP_Id === poSelected.AP_ID)
            ]);

            const fromViewPoH = getAllPoH.find(po => po.Doc_No === poSelected.Doc_No);

            if (!fromViewPoH || !fromViewAp) {
                throw new Error("Data not found");
            }

            // ฟังก์ชันเพื่อสร้างโมเดลใหม่สำหรับแต่ละแถวและคำนวณ itemTotal
            const createNewRow = (index, itemSelected) => {
                const itemQty = Number(itemSelected.Item_REC_Balance) || 0;
                const itemPriceUnit = Number(itemSelected.Item_Price_Unit) || 0;
                const itemDiscount = Number(itemSelected.Item_Discount) || 0;
                let itemTotal = itemQty * itemPriceUnit;

                if (itemSelected.Item_DisType === 2) {
                    itemTotal -= (itemDiscount / 100) * itemTotal; // ลดตามเปอร์เซ็นต์
                } else {
                    itemTotal -= itemDiscount; // ลดตามจำนวนเงิน
                }

                return {
                    ...recDetailModel(index + 1),
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemRecBalance: Number(itemSelected.Item_REC_Balance) || 0,
                    itemUnit: itemSelected.Item_Unit,
                    itemPriceUnit,
                    itemDiscount,
                    itemDisType: String(itemSelected.Item_DisType),
                    itemTotal,
                    itemStatus: itemSelected.Item_Status,
                    // whId: itemSelected.WH_ID,
                    whId: 13,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            const getAllItem = await getAllData('API_0202_PO_D', 'ORDER BY Line ASC');
            const filterItem = getAllItem.filter(item => item.Doc_No === poSelected.Doc_No);

            const getAllItemOld = await getAllData('API_0202_PO_D', 'ORDER BY Line ASC');
            const filterItemOld = getAllItemOld.filter(item => item.Doc_No === poSelected.Doc_No);

            // Find PO
            const getPoD = await getByDocId("PO_D", filterItem[0].Doc_ID, `ORDER BY Line ASC`);
            setPoDList(getPoD);

            if (filterItem.length > 0) {
                // ฟังก์ชันเพื่อกรองและสร้างรายละเอียดใหม่
                const newFormDetails = filterItem
                    .filter(item => Number(item.Item_REC_Balance) > 0) // กรองเฉพาะรายการที่มี itemQty มากกว่า 0
                    .map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                const firstItem = filterItem[0];

                setFormMasterList({
                    ...formMasterList,
                    refDocID: fromViewPoH.Doc_ID,
                    refDoc: poSelected.Doc_No,
                    refDocDate: formatThaiDateUi(poSelected.Doc_Date),
                    docDate: formatThaiDateUi(moment()),
                    docDueDate: formatThaiDateUi(moment()),
                    docRemark1: fromViewPoH.Doc_Remark1,
                    docRemark2: fromViewPoH.Doc_Remark2,
                    docType: fromViewPoH.Doc_Type,
                    docFor: fromViewPoH.Doc_For,
                    transportType: fromViewPoH.Transport_Type,
                    // discountValue: fromViewPoH.Discount_Value,
                    discountValue: 0.00,
                    creditTerm: fromViewPoH.CreditTerm,
                    apID: fromViewPoH.AP_ID,
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
                    updateDate: fromViewPoH.Update_Date,
                    updateByName: fromViewPoH.Update_By_Name
                });

                // setIsVatChecked(fromViewPoH.IsVat === 1 ? true : false);

                // const discountValueType = Number(fromViewPoH.Discount_Value_Type);
                // if (!isNaN(discountValueType)) {
                //     setSelectedDiscountValueType(discountValueType.toString());
                // }

            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${poSelected.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }

            if (filterItemOld.length > 0) {
                const newFormDetailsOld = filterItemOld.map((item, index) => createNewRow(formDetailList.length + index, item));
                setFormDetailOldList(newFormDetailsOld);
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${poSelected.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }

            handlePoClose(); // ปิด modal หลังจากเลือก
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
            const newRow = recDetailModel(formDetailList.length + 1);

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

    // การคำนวณยอดหลังหักส่วนลด (subFinal)
    useEffect(() => {
        const subFinal = totalPrice - receiptDiscount;
        setSubFinal(subFinal);
    }, [totalPrice, receiptDiscount]);

    // การคำนวณ VAT (vatAmount)
    useEffect(() => {
        // const vat = isVatChecked ? subFinal * 0.07 : 0;
        // setVatAmount(vat);
    }, [subFinal, isVatChecked]);

    // การคำนวณยอดรวมทั้งสิ้น (grandTotal)
    useEffect(() => {
        const grandTotal = subFinal + vatAmount;
        setGrandTotal(grandTotal);
    }, [subFinal, vatAmount]);

    return (
        <>
            <Breadcrumbs page={maxRecNo} items={[
                { name: 'จัดซื้อสินค้า', url: '/purchase' },
                { name: name, url: '/product-receipt' },
                { name: mode === 'U' ? "เรียกดู" + name : "สร้าง" + name, url: '#' },
            ]} />
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสาร</label>
                        <Datetime
                            className="input-spacing-input-date"
                            name="recDate"
                            value={formMasterList.recDate || null}
                            onChange={(date) => handleChangeDateMaster(date, 'recDate')}
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
                            // onChange={handleChangeMaster}
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
                            <button className="btn btn-outline-secondary" onClick={handlePoShow}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <PoModal
                            showPoModal={showPoModal}
                            handlePoClose={handlePoClose}
                            poDataList={poDataList}
                            onRowSelectPo={onRowSelectPo}
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
                            name="recDueDate"
                            value={formMasterList.recDueDate || null}
                            onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
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
                            disabled={false}
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
                <div className={`modal ${showConfirmModal ? 'show' : ''}`} style={{ display: showConfirmModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">ยืนยันการปิดงาน</h5>
                                <button type="button" className="close" onClick={() => setShowConfirmModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                ต้องการปิดงานใบสั่งซื้อ (PO) หรือไม่?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-lg w-25 shadow text-white"
                                    style={{ backgroundColor: '#EF6C00', fontSize: '16px' }}
                                    onClick={() => mode === 'U' ? handleUpdate(parseInt("2", 10)) : handleSubmit(parseInt("2", 10))}>
                                    ค้างรับ
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-lg w-25 shadow text-white"
                                    style={{ backgroundColor: 'red', fontSize: '16px' }}
                                    onClick={() => mode === 'U' ? handleUpdate(parseInt("3", 10)) : handleSubmit(parseInt("3", 10))}>
                                    ปิด PO
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
                {/* Overlay */}
                {showConfirmModal && <div className="modal-backdrop fade show"></div>}

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
                    onSubmit={handleConfirmtModal}
                    onUpdate={handleConfirmtModal}
                    onCancel={handleCancel}
                    mode={mode}
                    disabled={docStatusPo === 4 || docStatusReceivePo === 3 || formMasterList.recStatus !== 2 ? true : false}
                />
            </div>
            <br />
        </>
    );
}

export default Form;
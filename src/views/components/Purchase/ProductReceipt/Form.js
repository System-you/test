import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import PoModal from '../../Modal/PoModal';
import ApModal from '../../Modal/ApModal';
import ItemModal from '../../Modal/ItemModal';
import Summary from '../../Footer/Summary';
import FormAction from '../../Actions/FormAction';

// Model
import { recMasterModel } from '../../../../model/Purchase/RecMasterModel';
import { recDetailModel } from '../../../../model/Purchase/RecDetailModel';

// Utils
import {
    getAllData,
    getByDocId,
    getDocType,
    getTransType,
    getViewPoH,
    getViewAp,
    getViewItem,
    getAlert,
    formatCurrency,
    formatDateTime,
    formatThaiDate,
    formatThaiDateUi,
    formatThaiDateToDate,
    formatThaiDateUiToDate,
    getMaxRecNo,
    getCreateDateTime,
    setCreateDateTime,
    updateStatusByNo,
    updateQty
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxRecNo }) {
    const [formMasterList, setFormMasterList] = useState(recMasterModel());
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [poDataList, setPoDataList] = useState([]);
    const [apDataList, setApDataList] = useState([]);
    const [itemDataList, setItemDataList] = useState([]);

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

            // สำหรับ View เข้ามาเพื่อแก้ไขข้อมูล
            if (mode === 'U') {
                await getModelByNo(apDataList);
            }
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const getModelByNo = async (apDataList, refDocId) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับใน PO_H และ AP_ID ใน apDataList
            const [getAllRecH] = await Promise.all([
                getAllData('API_0301_REC_H', ''),
            ]);

            const fromViewRecH = getAllRecH.find(po => po.Rec_No === maxRecNo);

            const [fromViewAp] = await Promise.all([
                apDataList.find(ap => ap.AP_Id === fromViewRecH.AP_ID)
            ]);

            if (!fromViewRecH || !fromViewAp) {
                throw new Error("Data not found");
            };

            // ค้นหาข้อมูลที่ตรงกับใน PO_H และ AP_ID ใน apDataList
            // ***************************** refDocID = NULL ตอน onRowSelect ***********************
            const [detailResponse] = await Promise.all([
                getAllData('API_0202_PO_D', `AND Doc_ID = ${fromViewRecH.Ref_DocID}`),
            ]);

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
                    line: itemSelected.Line,
                    itemId: itemSelected.Item_Id,
                    itemCode: itemSelected.Item_Code,
                    itemName: itemSelected.Item_Name,
                    itemQty,
                    itemQtyOld: Number(itemQtyNow - itemRecQty),
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

            const getAllItem = await getAllData('API_0302_REC_D', '');

            const filterItem = getAllItem.filter(item => item.Rec_No === maxRecNo);

            if (filterItem.length > 0) {
                const newFormDetails = filterItem.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                createNewRow(formDetailList.length + 0, 100);

                const firstItem = filterItem[0];
                setFormMasterList({
                    refDocID: fromViewRecH.Ref_DocID,
                    refDoc: fromViewRecH.Ref_Doc,
                    refDocDate: formatThaiDateUi(fromViewRecH.Ref_DocDate),
                    recDate: formatThaiDate(new Date()),
                    docDueDate: formatThaiDate(fromViewRecH.Rec_DueDate),
                    docRemark1: fromViewRecH.Doc_Remark1,
                    docRemark2: fromViewRecH.Doc_Remark2,
                    docType: fromViewRecH.Doc_Type,
                    docFor: fromViewRecH.Doc_For,
                    transportType: fromViewRecH.Transport_Type,
                    discountValue: fromViewRecH.Discount_Value,
                    creditTerm: firstItem.CreditTerm,
                    apID: fromViewRecH.AP_ID,
                    apCode: firstItem.AP_Code,
                    apName: firstItem.AP_Name,
                    apAdd1: firstItem.AP_Add1,
                    apAdd2: firstItem.AP_Add2,
                    apAdd3: firstItem.AP_Add3,
                    apProvince: firstItem.AP_Province,
                    apZipcode: firstItem.AP_Zipcode,
                    apTaxNo: firstItem.AP_TaxNo,
                    createdByName: firstItem.Created_By_Name,
                    createdDate: setCreateDateTime(new Date(firstItem.Created_Date)),
                    updateDate: firstItem.Update_Date,
                    updateByName: firstItem.Update_By_Name
                });

                setIsVatChecked(fromViewRecH.IsVat === 1 ? true : false);

                const discountValueType = Number(fromViewRecH.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${fromViewRecH.Rec_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    const handleSubmit = async (status) => {
        try {
            setShowConfirmModal(false);

            // หาเลข Rec_No ที่สูงสุดใหม่ แล้วเอามา +1 ก่อนบันทึก
            const masterList = await getAllData('REC_H', '');

            const currentYear = new Date().getFullYear();
            const thaiYear = currentYear + 543; // Convert to Thai year (พ.ศ.)
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก
            let newMaxRec = "REC" + thaiYear.toString().slice(-2) + currentMonth + "0001";

            if (masterList && masterList.length > 0) {
                const sortedData = masterList.sort((a, b) => a.Rec_No.localeCompare(b.Rec_No));
                // หาค่าสูงสุดของ Rec_No
                const maxRec = getMaxRecNo(sortedData, "REC");
                newMaxRec = maxRec;
            } else {
                // ถ้าไม่มีข้อมูลใน masterList ก็ใช้ newMaxRec ที่สร้างขึ้นตอนแรก
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                rec_no: newMaxRec,
                rec_date: formatThaiDateToDate(formMasterList.recDate),
                rec_due_date: formatThaiDateToDate(formMasterList.recDueDate),
                rec_status: parseInt("2", 10),
                doc_code: parseInt("3", 10),
                doc_type: parseInt("1", 10),
                doc_for: formMasterList.docFor,
                doc_is_prc: "N",
                doc_is_po: parseInt("0", 10),
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
            // console.debug("formMasterData : ", formMasterData);

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

                        const detailPromises = validDetails.map(async (item) => {
                            const formDetailData = {
                                rec_id: recId,
                                line: lineIndex,
                                item_id: item.itemId,
                                item_code: item.itemCode,
                                item_name: item.itemName,
                                item_qty: item.itemQty,
                                item_unit: item.itemUnit,
                                item_price_unit: item.itemPriceUnit,
                                item_discount: item.itemDiscount,
                                item_distype: item.itemDisType === '1' ? 1 : 2,
                                item_total: item.itemTotal,
                                item_status: item.itemStatus === 'Y' ? 1 : 0,
                                wh_id: null,
                                zone_id: 1,
                                lt_id: 1,
                                ds_seq: formatDateTime(new Date())
                            };

                            const detailResponse = await getByDocId("PO_D", formMasterList.refDocID, `AND Item_Id = ${item.itemId}`);

                            // คำนวณค่าต่าง ๆ
                            const itemQty = parseFloat(item.itemQty);
                            const itemRecQty = detailResponse[0].Item_REC_Qty + itemQty;
                            const itemRecBalance = detailResponse[0].Item_REC_Balance - itemQty;

                            // ลบจำนวนสินค้าที่ PO_D จำนวนรับ และ จำนวนค้างรับ (updateQty = async (table, updateCode, where))
                            await updateQty(
                                'PO_D',
                                `Item_REC_Qty = ${itemRecQty}, Item_REC_Balance = ${itemRecBalance}`,
                                `WHERE Doc_ID = ${formMasterList.refDocID} AND Item_Id = ${item.itemId}`
                            );

                            lineIndex++;

                            // For Log PO_D
                            // console.log("formDetailData : ", formDetailData);

                            return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-rec-d`, formDetailData, {
                                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                            });
                        });

                        await Promise.all(detailPromises);

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

    const handleChangeMaster = (e) => {
        const { name, value } = e.target;
        // อัปเดตค่าใน formMasterList
        setFormMasterList((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangeDetail = (index, field, value) => {
        // ตรวจสอบว่าค่าที่กรอกเข้ามาเป็นตัวเลขเท่านั้น
        if (!/^\d*$/.test(value)) {
            //getAlert("FAILED", "กรุณากรอกเฉพาะตัวเลขเท่านั้น");
            return;
        }

        const oldList = [...formDetailOldList];

        if (parseInt(value, 10) > oldList[index][field]) {
            const updatedList = [...formDetailList];
            updatedList[index][field] = updatedList[index].itemQtyOld;
            setFormDetailList(updatedList);
            getAlert("FAILED", "ไม่สามารถรับสินค้าเกินกว่ายอด PO ได้");
        } else if (parseInt(value, 10) < oldList[index][field]) {
            // setShowConfirmModal(true);
            updateFormDetailList(index, field, value);
        } else {
            updateFormDetailList(index, field, value);
        }
    };

    const handleConfirmModal = () => {
        let shouldShowModal = false;

        formDetailList.forEach((item) => {
            // แปลงค่าของ item.itemQty และ item.itemQtyOld เป็นตัวเลข
            const itemQty = Number(item.itemQty);
            const itemQtyOld = Number(item.itemQtyOld);

            if (itemQty !== itemQtyOld) {
                shouldShowModal = true;
            }
        });

        if (shouldShowModal) {
            setShowConfirmModal(true);
        } else {
            handleSubmit(parseInt("3", 10));
        }
    };

    const updateFormDetailList = (index, field, value) => {
        const updatedList = [...formDetailList];
        updatedList[index][field] = value;

        const itemQty = Number(updatedList[index].itemQty) || 0;
        const itemPriceUnit = Number(updatedList[index].itemPriceUnit) || 0;
        const itemDiscount = Number(updatedList[index].itemDiscount) || 0;
        const itemDisType = updatedList[index].itemDisType;

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
                    itemQtyOld: Number(itemSelected.Item_REC_Balance) || 0,
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

            const getAllItem = await getAllData('API_0202_PO_D', 'ORDER BY Line ASC');
            const filterItem = getAllItem.filter(item => item.Doc_No === poSelected.Doc_No);

            const getAllItemOld = await getAllData('API_0202_PO_D', 'ORDER BY Line ASC');
            const filterItemOld = getAllItemOld.filter(item => item.Doc_No === poSelected.Doc_No);

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
                    docDate: formatThaiDate(new Date()),
                    docDueDate: formatThaiDate(new Date()),
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
                    createdDate: getCreateDateTime(new Date()),
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
                { name: "สร้าง" + name, url: '#' },
            ]} />
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสาร</label>
                        <input
                            type="date"
                            className="form-control input-spacing"
                            name="recDate"
                            value={formMasterList.recDate}
                            onChange={handleChangeMaster}
                            id="recDate"
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
                        <input
                            type="date"
                            className="form-control input-spacing"
                            name="docDueDate"
                            value={formMasterList.recDueDate || ''}
                            onChange={handleChangeMaster} />
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
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">รายละเอียดสินค้า</h4>
                            <button
                                type="button"
                                className="btn custom-button"
                                onClick={handleItemShow}
                                hidden={true}>
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
                                            <th className="text-center" style={{ width: '16%' }}>ชื่อสินค้า</th>
                                            <th className="text-center" style={{ width: '8%' }}>จำนวนรับ</th>
                                            <th className="text-center" style={{ width: '8%' }}>จำนวนค้างรับ</th>
                                            <th className="text-center" style={{ width: '6%' }}>หน่วย</th>
                                            <th className="text-center" style={{ width: '8%' }}>ราคาต่อหน่วย</th>
                                            <th className="text-center" style={{ width: '8%' }}>ส่วนลด</th>
                                            <th className="text-center" style={{ width: '5%' }}>%</th>
                                            <th className="text-center" style={{ width: '10%' }}>จำนวนเงินรวม</th>
                                            <th className="text-center" style={{ width: '16%' }}>คลังสินค้า</th>
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
                                                        type="text"
                                                        className="form-control text-center"
                                                        value={item.itemQty || 0}
                                                        onChange={(e) => handleChangeDetail(index, 'itemQty', e.target.value)}
                                                        disabled={false}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="text"
                                                        className="form-control text-center"
                                                        value={item.itemQtyOld || 0}
                                                        onChange={(e) => handleChangeDetail(index, 'itemQtyOld', e.target.value)}
                                                        disabled={true}
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
                                                        type="text"
                                                        className="form-control text-end"
                                                        value={formatCurrency(item.itemPriceUnit || 0)}
                                                        onChange={(e) => handleChangeDetail(index, 'itemPriceUnit', e.target.value)}
                                                        disabled={true}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="text"
                                                        className="form-control text-end"
                                                        value={formatCurrency(item.itemDiscount || 0)}
                                                        onChange={(e) => handleChangeDetail(index, 'itemDiscount', e.target.value)}
                                                        disabled={true}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <select
                                                        className="form-select"
                                                        value={item.itemDisType || ''}
                                                        onChange={(e) => handleChangeDetail(index, 'itemDisType', e.target.value)}
                                                        disabled={true}
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
                                                        disabled={true}
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
                                <button className="btn btn-info" onClick={() => handleSubmit(parseInt("3", 10))}>
                                    ใช่
                                </button>
                                <button className="btn btn-danger" onClick={() => handleSubmit(parseInt("2", 10))}>
                                    ไม่
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
                <FormAction onSubmit={handleConfirmModal} mode={mode} />
            </div>
            <br />
        </>
    );
}

export default Form;
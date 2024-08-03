import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import RecModal from '../../Modal/RecModal';
import ApModal from '../../Modal/ApModal';
import ItemModal from '../../Modal/ItemModal';
import FormAction from '../../Actions/FormAction';

// Model
import { payMasterModel } from '../../../../model/Purchase/PayMasterModel';
import { payDetailModel } from '../../../../model/Purchase/PayDetailModel';

// Utils
import {
    getAllData,
    getDocType,
    getTransType,
    getViewAp,
    getViewItem,
    getAlert,
    formatCurrency,
    formatDateTime,
    formatThaiDate,
    formatThaiDateUi,
    formatThaiDateToDate,
    formatThaiDateUiToDate,
    getMaxPayNo,
    getCreateDateTime,
    setCreateDateTime
} from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxDocNo }) {
    const [formMasterList, setFormMasterList] = useState([payMasterModel()]);
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [recDataList, setRecDataList] = useState([]);
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

    // ใช้สำหรับการ Rendered Form ต่างๆ
    const [docRefType, setDocTypeRef] = useState("1");

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

    const getModelByNo = async (apDataList) => {
        try {
            // ค้นหาข้อมูลที่ตรงกับใน PR_H และ AP_ID ใน apDataList
            const [getAllPayH] = await Promise.all([
                getAllData('API_0401_PAY_H', ''),
            ]);

            const fromViewPayH = getAllPayH.find(pay => pay.Pay_No === maxDocNo);

            const [fromViewAp] = await Promise.all([
                apDataList.find(ap => ap.AP_Id === fromViewPayH.AP_Id)
            ]);

            if (!fromViewPayH || !fromViewAp) {
                throw new Error("Data not found");
            };

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
                    itemStatus: itemSelected.Item_Status,
                    whId: itemSelected.WH_ID,
                    whName: itemSelected.WH_Name,
                    zoneId: itemSelected.Zone_ID,
                    ltId: itemSelected.LT_ID,
                    dsSeq: itemSelected.DS_SEQ,
                };
            };

            const getAllItem = await getAllData('API_0402_PAY_D', 'ORDER BY Line ASC');
            const filterItem = getAllItem.filter(item => item.Pay_No === maxDocNo);

            if (filterItem.length > 0) {
                const newFormDetails = filterItem.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                const firstItem = filterItem[0];

                setFormMasterList({
                    refDocID: fromViewPayH.Ref_DocID,
                    refDoc: fromViewPayH.Ref_Doc,
                    refDocDate: formatThaiDateUi(fromViewPayH.Ref_DocDate),
                    docDate: formatThaiDate(new Date()),
                    docDueDate: formatThaiDate(new Date()),
                    docRemark1: fromViewPayH.Doc_Remark1,
                    docRemark2: fromViewPayH.Doc_Remark2,
                    docType: fromViewPayH.Doc_Type,
                    docFor: fromViewPayH.Doc_For,
                    transportType: fromViewPayH.Transport_Type,
                    discountValue: fromViewPayH.Discount_Value,
                    creditTerm: firstItem.CreditTerm,
                    apID: fromViewPayH.AP_ID,
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

                setIsVatChecked(fromViewPayH.IsVat === 1 ? true : false);

                const discountValueType = Number(fromViewPayH.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }
            } else {
                getAlert('FAILED', `ไม่พบข้อมูลที่ตรงกับเลขที่เอกสาร ${fromViewPayH.Doc_No} กรุณาตรวจสอบและลองอีกครั้ง`);
            }
        } catch (error) {
            getAlert("FAILED", error.message || error);
        }
    };

    const handleSubmit = async () => {
        try {
            // หาเลข DOC_NO ที่สูงสุดใหม่ แล้วเอามา +1 ก่อนบันทึก
            const masterList = await getAllData('PAY_H', '');

            const currentYear = new Date().getFullYear();
            const thaiYear = currentYear + 543; // Convert to Thai year (พ.ศ.)
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก
            let newMaxDoc = "PAY" + thaiYear.toString().slice(-2) + currentMonth + "0001";

            if (masterList && masterList.length > 0) {
                const sortedData = masterList.sort((a, b) => a.Pay_No.localeCompare(b.Pay_No));
                // หาค่าสูงสุดของ Pay_No
                const maxDoc = getMaxPayNo(sortedData, "PAY");
                newMaxDoc = maxDoc;
            } else {
                // ถ้าไม่มีข้อมูลใน masterList ก็ใช้ newMaxDoc ที่สร้างขึ้นตอนแรก
            }

            // ข้อมูลหลักที่จะส่งไปยัง API
            const formMasterData = {
                pay_no: newMaxDoc,
                pay_date: formatThaiDateToDate(formMasterList.docDate),
                doc_due_date: formatThaiDateToDate(formMasterList.docDueDate),
                pay_status: parseInt("1", 10),
                pay_type: docRefType === '1' ? parseInt("1", 10) : parseInt("2", 10),
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
                printed_by: formMasterList.printedBy,
                cancel_memo: formMasterList.cancelMemo
            };

            // For Log PAY_H
            console.debug("formMasterData : ", formMasterData);
            getAlert("FAILED", "อยู่ในระหว่างการปรับปรุง ยังไม่สามารถบันทึกได้");

            // ส่งข้อมูลหลักไปยัง API
            // const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-h`, formMasterData, {
            //     headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            // });

            // ตรวจสอบสถานะการตอบกลับ
            // if (response.data.status === 'OK') {
            //     const getPayIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-pay-no`, {
            //         table: 'PAY_H',
            //         pay_no: formMasterData.pay_no
            //     }, {
            //         headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            //     });

            //     // ส่งข้อมูลรายละเอียดหากพบ Pay_Id
            //     if (getPayIdResponse && getPayIdResponse.data.length > 0) {
            //         const payId = parseInt(getPayIdResponse.data[0].Pay_Id, 10);
            //         let index = 1;

            //         const detailPromises = formDetailList.map(async (item) => {
            //             const formDetailData = {
            //                 pay_id: parseInt(payId, 10),
            //                 line: index,
            //                 item_id: item.itemId,
            //                 item_code: item.itemCode,
            //                 item_name: item.itemName,
            //                 item_qty: item.itemQty,
            //                 item_unit: item.itemUnit,
            //                 item_price_unit: item.itemPriceUnit,
            //                 item_discount: item.itemDiscount,
            //                 item_distype: item.itemDisType === '1' ? parseInt("1", 10) : parseInt("2", 10),
            //                 item_total: item.itemTotal,
            //                 item_status: item.itemStatus === 'Y' ? 1 : 0,
            //                 wh_id: null,
            //                 zone_id: parseInt("1", 10),
            //                 lt_id: parseInt("1", 10),
            //                 ds_seq: formatDateTime(new Date())
            //             };
            //             index++;

            //             // For Log PAY_D
            //             // console.log("formDetailData : ", formDetailData);

            //             return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-d`, formDetailData, {
            //                 headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            //             });
            //         });

            //         await Promise.all(detailPromises);
            //     }

            //     callInitialize();
            //     getAlert(response.data.status, response.data.message);
            // }
        } catch (error) {
            getAlert("FAILED", error.response?.data?.message || error.message);
        }
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงใน formMasterList
    const handleChangeMaster = (event) => {
        const { name, value } = event.target;

        // อัปเดตทุกรายการใน formMasterList
        setFormMasterList(prevState =>
            prevState.map(item => ({
                ...item,
                [name]: value
            }))
        );
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงใน formDetailList
    const handleChangeDetail = (index, field, value) => {
        // ตรวจสอบว่าค่าที่กรอกเข้ามาเป็นตัวเลขเท่านั้น
        if (!/^\d*$/.test(value)) {
            //getAlert("FAILED", "กรุณากรอกเฉพาะตัวเลขเท่านั้น");
            return;
        }

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

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของเอกสารอ้างอิง
    const handleChangePayType = (value) => {
        // รีเซ็ตฟอร์ม
        setFormMasterList(prevState => ([{
            ...prevState[0],
            refDocID: null,
            refDoc: null,
            refDocDate: null,
            docDate: null,
            docDueDate: null,
            docRemark1: null,
            docRemark2: null,
            docType: null,
            docFor: null,
            transportType: null,
            discountValue: null,
            creditTerm: null,
            apID: null,
            apCode: null,
            apName: null,
            apAdd1: null,
            apAdd2: null,
            apAdd3: null,
            apProvince: null,
            apZipcode: null,
            apTaxNo: null
        }]));

        // ใช้ฟังก์ชัน payMasterModel และตรวจสอบให้แน่ใจว่าเป็นอาร์เรย์
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
        setDocTypeRef(value);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของสถานะจ่าย
    const handlePaymentStatusChange = (status) => {
        // เคลียค่าทุกครั้งยกเว้นตำแหน่งที่ 0
        setInstallmentCount(1);
        setPaymentStatus(status);

        // สร้าง default model ที่ใช้เป็นค่าเริ่มต้น
        const defaultModel = payMasterModel();

        // เก็บค่าของ formMasterList ที่มีอยู่เดิม
        const currentList = formMasterList[0] ? formMasterList[0] : defaultModel;

        if (status === 'oneTime') {
            // ตั้งค่าให้กับรายการเดียว โดยเก็บค่าเดิมไว้ที่ตำแหน่งที่ 0
            setFormMasterList([{
                ...currentList,
                amountPay: grandTotal,
                docRemark1: '',
                docRemark2: ''
            }]);
        } else {
            // สร้างรายการตามจำนวน installmentCount โดยไม่เคลียร์ datePay
            const newList = Array.from({ length: installmentCount }, (v, i) => {
                let amountPay = (grandTotal / installmentCount).toFixed(2);
                if (i === installmentCount - 1) {
                    amountPay = (grandTotal - (amountPay * (installmentCount - 1))).toFixed(2);
                }
                return {
                    ...defaultModel,
                    amountPay: amountPay,
                    docRemark1: '',
                    docRemark2: ''
                };
            });
            // ตั้งค่าให้กับ formMasterList โดยเก็บค่าเดิมไว้ที่ตำแหน่งที่ 0 และแทนที่ค่าใหม่
            newList[0] = currentList;
            setFormMasterList(newList);
        }
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของจำนวนงวด
    const handleInstallmentCountChange = (value) => {
        if (!/^\d*$/.test(value)) return;  // ตรวจสอบว่าเป็นตัวเลขเท่านั้น

        const count = parseInt(value, 10);  // แปลงค่าจาก string เป็น number

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
                amountPay: amountPay,
                docRemark1: '', // เคลียร์ค่าเฉพาะที่ต้องการ
                docRemark2: ''  // เคลียร์ค่าเฉพาะที่ต้องการ
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
            // เคลียร์ค่าใน formMasterList และ formDetailList
            setFormMasterList([payMasterModel()]);
            setFormDetailList([]);

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
            const firstItem = allDetails[0];

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
                    docDate: formatThaiDate(results[0].fromViewRecH.Rec_Date),
                    docDueDate: formatThaiDate(results[0].fromViewRecH.Rec_DueDate),
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
                    createdDate: getCreateDateTime(new Date()),
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
            // console.debug("Selected Receipts:", recSelected);
            onRowSelectRec(recSelected)

            // แจ้งเตือนผู้ใช้ว่าการเลือกสำเร็จ
            getAlert("OK", "การเลือกใบรับสินค้าสำเร็จ");
        } catch (error) {
            console.error("Error in confirming receipt selection:", error);
            getAlert("FAILED", "เกิดข้อผิดพลาดในการเลือกใบรับสินค้า");
        }
    };

    // SET AP
    const [showApModal, setShowApModal] = useState(false);
    const handleApShow = () => setShowApModal(true);
    const handleApClose = () => setShowApModal(false);
    const onRowSelectAp = (apSelected) => {
        try {
            setFormMasterList(prevState => {
                // เช็คว่ามีข้อมูลใน array หรือไม่
                const updatedList = [...prevState];
                updatedList[0] = {
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
                return updatedList;
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
            const newRow = payDetailModel(formDetailList.length + 1);

            console.debug(itemSelected);

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
    }, [subFinal, vatAmount]);

    return (
        <>
            <Breadcrumbs page={maxDocNo} items={[
                { name: 'จัดซื้อสินค้า', url: '/purchase' },
                { name: name, url: '/payment-voucher' },
                { name: "สร้าง" + name, url: '#' },
            ]} />
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>วันที่เอกสาร</label>
                        <input
                            type="date"
                            className="form-control input-spacing"
                            name="docDate"
                            value={formMasterList[0].docDate || ''}
                            onChange={handleChangeMaster}
                            id="docDate"
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
                                    (formMasterList[0].apCode || '')
                                    + " " +
                                    (formMasterList[0].apName || '')
                                }
                                onChange={handleChangeMaster}
                                disabled={true}
                            />
                            <button className="btn btn-outline-secondary" onClick={handleApShow} disabled={docRefType === '1' ? true : false}>
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
                            value={formMasterList[0].createdDate}
                            // onChange={handleChangeMaster}
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
                            value={formMasterList.docRefType}
                            className="form-select form-control input-spacing"
                            onChange={(e) => handleChangePayType(e.target.value)}>
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
                            value={formMasterList[0].apAdd1 || ''}
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
                            value={formMasterList[0].createdByName || ''}
                            onChange={handleChangeMaster}
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
                                value={formMasterList[0].refDoc || ''}
                                onChange={handleChangeMaster}
                                disabled={true}
                            />
                            <button className="btn btn-outline-secondary" onClick={handleRecShow} hidden={docRefType === '1' ? false : true}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <RecModal
                            showRecModal={showRecModal}
                            handleRecClose={handleRecClose}
                            recDataList={recDataList}
                            onRowSelectRec={onRowSelectRec}
                            onConfirmRecSelection={onConfirmRecSelection}
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
                                (formMasterList[0].apAdd2 || '')
                                + " " +
                                (formMasterList[0].apAdd3 || '')
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
                            value={formMasterList[0].updateDate || ''}
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
                            value={formMasterList[0].refDocDate || ''}
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
                                (formMasterList[0].apProvince || '')
                                + " " +
                                (formMasterList[0].apZipcode || '')
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
                            value={formMasterList[0].updateByName || ''}
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
                            value={formMasterList[0].docType}
                            onChange={handleChangeMaster}
                            disabled={docRefType === '1'}
                        >
                            {docRefType !== '1' && tbDocType.map((docType) => (
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
                                formMasterList[0].apTaxNo || ''
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
                            value={formMasterList[0].approvedDate || ''}
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
                            disabled={docRefType === '1'}
                            className="form-select form-control input-spacing"
                        >
                            {docRefType !== '1' && (
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
                            value={formMasterList[0].approvedByName || ''}
                            onChange={handleChangeMaster}
                            disabled={true} />
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-3">
                    <div className="d-flex align-items-center">
                        <label>Due Date</label>
                        <input
                            type="date"
                            className="form-control input-spacing"
                            name="recDueDate"
                            value={formMasterList[0].docDueDate}
                            onChange={handleChangeMaster} />
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
                            value={formMasterList[0].approvedMemo || ''}
                            onChange={handleChangeMaster}
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
                                                                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                                                                                                            type="date"
                                                                                                            className="form-control text-center"
                                                                                                            value={item.datePay || ''}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'datePay', e.target.value)}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="text-end">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control text-end input-spacing"
                                                                                                            value={item.amountPay || grandTotal}
                                                                                                            onChange={(e) => handleChangeMasterList(index, 'amountPay', e.target.value)}
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
                                                hidden={docRefType === '1' ? true : false}>
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
                                                            {docRefType !== '2' && (
                                                                <th className="text-center" style={{ width: '8%' }}>
                                                                    เลขที่เอกสาร (REC)
                                                                </th>
                                                            )}
                                                            <th className="text-center" style={{ width: docRefType === '2' ? '12%' : '10%' }}>
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
                                                                <td className="text-center">{index + 1}</td>
                                                                <td hidden={docRefType === '1' ? false : true}
                                                                    className="text-center">
                                                                    <span>{item.recNo || ''}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span>{item.itemCode || ''}</span>
                                                                </td>
                                                                <td className="text-left">
                                                                    <span>{item.itemName || ''}</span>
                                                                </td>
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
                                                                <td className="text-center">
                                                                    <span>{item.itemUnit || ''}</span>
                                                                </td>
                                                                <td className="text-end">
                                                                    {docRefType === '1' ? (
                                                                        <span>{formatCurrency(item.itemPriceUnit || 0)}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end"
                                                                            value={item.itemPriceUnit || 0}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemPriceUnit', e.target.value)}
                                                                            disabled={docRefType === '1' ? true : false}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="text-end">
                                                                    {docRefType === '1' ? (
                                                                        <span>{formatCurrency(item.itemDiscount || 0)}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end"
                                                                            value={item.itemDiscount || 0}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemDiscount', e.target.value)}
                                                                            disabled={docRefType === '1' ? true : false}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="text-center">
                                                                    {docRefType === '1' ? (
                                                                        <span>{item.itemDisType === "1" ? "฿" : item.itemDisType === "2" ? "%" : ""}</span>
                                                                    ) : (
                                                                        <select
                                                                            className="form-select"
                                                                            value={item.itemDisType || ''}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemDisType', e.target.value)}
                                                                            disabled={docRefType === '1' ? true : false}
                                                                        >
                                                                            <option value="1">฿</option>
                                                                            <option value="2">%</option>
                                                                        </select>
                                                                    )}
                                                                </td>
                                                                <td className="text-end">
                                                                    {docRefType === '1' ? (
                                                                        <span>{formatCurrency(item.itemTotal || 0)}</span>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-end"
                                                                            value={item.itemTotal || 0}
                                                                            disabled={true}
                                                                            onChange={(e) => handleChangeDetail(index, 'itemTotal', e.target.value)}
                                                                        />
                                                                    )}
                                                                </td>
                                                                {docRefType === '2' ? (
                                                                    <>
                                                                        <td className="text-center">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={item.whName || ''}
                                                                                disabled
                                                                                onChange={(e) => handleChangeDetail(index, 'whId', item.whId)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-danger"
                                                                                onClick={() => handleRemoveRow(index)}
                                                                                disabled={docRefType === '1'}
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
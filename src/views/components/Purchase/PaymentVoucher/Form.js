import React, { useState, useEffect } from 'react';
import Axios from "axios";
import './../../../../assets/css/purchase/form.css';

// Components
import Breadcrumbs from '../../Breadcrumbs';
import PoModal from '../../Modal/PoModal';
import ApModal from '../../Modal/ApModal';
import ItemTable from '../../Content/ItemTable';
import Summary from '../../Footer/Summary';
import FormAction from '../../Actions/FormAction';

// Model
import { payMasterModel } from '../../../../model/Purchase/PayMasterModel';
import { payDetailModel } from '../../../../model/Purchase/PayDetailModel';

// Utils
import { getAllData, getDocType, getTransType, getViewPoH, getViewAp, getViewItem, getAlert, formatCurrency, formatDateTime, formatThaiDate, formatThaiDateToDate, getMaxPayNo, getCreateDateTime } from '../../../../utils/SamuiUtils';

function Form({ callInitialize, mode, name, maxDocNo }) {
    const [formMasterList, setFormMasterList] = useState([]);
    const [formDetailList, setFormDetailList] = useState([]);
    const [tbDocType, setTbDocType] = useState([]);
    const [tbTransType, setTbTransType] = useState([]);
    const [poDataList, setPoDataList] = useState([]);
    const [apDataList, setApDataList] = useState([]);
    const [itemDataList, setItemDataList] = useState([]);

    // การคำนวณเงิน
    const [selectedDiscountValueType, setSelectedDiscountValueType] = useState("1");
    const [totalPrice, setTotalPrice] = useState(0);
    const [receiptDiscount, setReceiptDiscount] = useState(0);
    const [subFinal, setSubFinal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [isVatChecked, setIsVatChecked] = useState(false);
    const [vatAmount, setVatAmount] = useState(0);

    const [docRefType, setDocTypeRef] = useState("1");

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
                setPoDataList(poDataList);
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
                    refDocID: '1',
                    refDoc: maxDocNo,
                    refDocDate: formatThaiDate(fromViewPayH.Pay_Date),
                    docDate: formatThaiDate(fromViewPayH.Pay_Date),
                    docDueDate: formatThaiDate(fromViewPayH.Doc_DueDate),
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
                    apTaxNo: firstItem.AP_TaxNo
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

    const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setSelectedDiscountValueType(selectedDiscountValueType === name ? null : name);
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
                ref_doc_date: formMasterList.refDocDate,
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
                created_date: formatThaiDateToDate(formMasterList.createdDate),
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
            // console.log("formMasterData : ", formMasterData);

            // ส่งข้อมูลหลักไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-h`, formMasterData, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            // ตรวจสอบสถานะการตอบกลับ
            if (response.data.status === 'OK') {
                const getPayIdResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-pay-no`, {
                    table: 'PAY_H',
                    pay_no: formMasterData.pay_no
                }, {
                    headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
                });

                // ส่งข้อมูลรายละเอียดหากพบ Pay_Id
                if (getPayIdResponse && getPayIdResponse.data.length > 0) {
                    const payId = parseInt(getPayIdResponse.data[0].Pay_Id, 10);
                    let index = 1;

                    const detailPromises = formDetailList.map(async (item) => {
                        const formDetailData = {
                            pay_id: parseInt(payId, 10),
                            line: index,
                            item_id: item.itemId,
                            item_code: item.itemCode,
                            item_name: item.itemName,
                            item_qty: item.itemQty,
                            item_unit: item.itemUnit,
                            item_price_unit: item.itemPriceUnit,
                            item_discount: item.itemDiscount,
                            item_distype: item.itemDisType === '1' ? parseInt("1", 10) : parseInt("2", 10),
                            item_total: item.itemTotal,
                            item_status: item.itemStatus === 'Y' ? 1 : 0,
                            wh_id: null,
                            zone_id: parseInt("1", 10),
                            lt_id: parseInt("1", 10),
                            ds_seq: formatDateTime(new Date())
                        };
                        index++;

                        // For Log PAY_D
                        // console.log("formDetailData : ", formDetailData);

                        return Axios.post(`${process.env.REACT_APP_API_URL}/api/create-pay-d`, formDetailData, {
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

    const handleChangeMaster = (event) => {
        const { name, value } = event.target;
        setFormMasterList(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleChangeDetail = (index, field, value) => {
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

    // ตรวจสอบค่าใน handleChangePayType
    const handleChangePayType = (value) => {
        setFormMasterList(prevState => ({
            ...prevState,
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
        }));

        const newPayMasterModel = payMasterModel(); // เก็บไว้ในตัวแปรก่อน
        setFormMasterList(newPayMasterModel); // ตรวจสอบให้แน่ใจว่าเป็นอาร์เรย์
        setFormDetailList([]);
        setDocTypeRef(value);
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
                getAllData('View_PO_H', 'ORDER BY Doc_No DESC'),
                apDataList.find(ap => ap.AP_Id === poSelected.AP_ID)
            ]);

            const fromViewPrH = getAllPoH.find(po => po.Doc_No === poSelected.Doc_No);

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

            const getAllItem = await getAllData('View_PO_D', 'ORDER BY Line ASC');
            const filterItem = getAllItem.filter(item => item.Doc_No === poSelected.Doc_No);

            if (filterItem.length > 0) {
                const newFormDetails = filterItem.map((item, index) => createNewRow(formDetailList.length + index, item));

                setFormDetailList(newFormDetails);

                const firstItem = filterItem[0];

                setFormMasterList({
                    refDocID: fromViewPrH.Doc_Id,
                    refDoc: poSelected.Doc_No,
                    refDocDate: formatThaiDate(poSelected.Doc_Date),
                    docDate: formatThaiDate(fromViewPrH.Doc_Date),
                    docDueDate: formatThaiDate(fromViewPrH.Doc_DueDate),
                    docRemark1: fromViewPrH.Doc_Remark1,
                    docRemark2: fromViewPrH.Doc_Remark2,
                    docType: fromViewPrH.Doc_Type,
                    docFor: fromViewPrH.Doc_For,
                    transportType: fromViewPrH.Transport_Type,
                    discountValue: fromViewPrH.Discount_Value,
                    creditTerm: fromViewPrH.CreditTerm,
                    apID: fromViewPrH.AP_ID,
                    apCode: firstItem.AP_Code,
                    apName: firstItem.AP_Name,
                    apAdd1: firstItem.AP_Add1,
                    apAdd2: firstItem.AP_Add2,
                    apAdd3: firstItem.AP_Add3,
                    apProvince: firstItem.AP_Province,
                    apZipcode: firstItem.AP_Zipcode,
                    apTaxNo: firstItem.AP_TaxNo
                });

                setIsVatChecked(fromViewPrH.IsVat === 1 ? true : false);

                const discountValueType = Number(fromViewPrH.Discount_Value_Type);
                if (!isNaN(discountValueType)) {
                    setSelectedDiscountValueType(discountValueType.toString());
                }

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
                    itemUnit: itemSelected.Item_Unit,
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
                            value={formMasterList.docDate || ''}
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
                                    (formMasterList.apCode || '')
                                    + " " +
                                    (formMasterList.apName || '')
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
                            value={getCreateDateTime()}
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
                            <option value="1">จ่ายตาม PO</option>
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
                            <button className="btn btn-outline-secondary" onClick={handlePoShow} hidden={docRefType === '1' ? false : true}>
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
                        <label>ประเภทเอกสาร</label>
                        <select
                            className="form-select form-control input-spacing"
                            name="docType"
                            value={formMasterList.docType}
                            onChange={handleChangeMaster}
                            disabled={docRefType === '1' ? true : false}
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
                                formMasterList.apTaxNo || ''
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
                            value={formMasterList.approvedDate || ''}
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
                            disabled={docRefType === '1' ? true : false}
                            className="form-select form-control input-spacing"
                        >
                            <option value="1">ซื้อมาเพื่อใช้</option>
                            <option value="2">ซื้อมาเพื่อขาย</option>
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
                            value={formMasterList.approvedByName || ''}
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
                            name="docDueDate"
                            value={formMasterList.docDueDate}
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
                            value={formMasterList.approvedMemo || ''}
                            onChange={handleChangeMaster}
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
                    disabled={docRefType === '1' ? true : false}
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
                    disabled={docRefType === '1' ? true : false}
                />
                <FormAction onSubmit={handleSubmit} mode={mode} />
            </div>
            <br />
        </>
    );
}

export default Form;
import {
    getCreateDateTime
} from '../../utils/SamuiUtils';

export const recMasterModel = () => {
    const today = new Date();
    const year = today.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const formattedNewDate = `${year}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    // const formattedTime = today.toTimeString().split(' ')[0]; // แยกเอาเฉพาะเวลา

    return {
        recNo: null,
        recDate: formattedNewDate,
        recDueDate: formattedNewDate,
        recStatus: null,
        docCode: null,
        docType: 1,
        docFor: 1,
        refDocID: null,
        refDoc: null,
        refDocDate: null,
        refProjectID: null,
        refProjectNo: null,
        compId: null,
        transportType: 1,
        docRemark1: null,
        docRemark2: null,
        apID: null,
        apCode: null,
        apName: null,
        actionHold: null,
        discountValue: 0,
        discountValueType: null,
        discountValueTotal: 0,
        discountCash: null,
        discountCashType: null,
        discountTransport: null,
        discountTransportType: null,
        isVat: null,
        docSEQ: null,
        creditTerm: null,
        creditTerm1Day: null,
        creditTerm1Remark: null,
        creditTerm2Remark: null,
        accCode: null,
        empName: null,
        createdDate: getCreateDateTime(new Date()),
        createdByName: window.localStorage.getItem('name'),
        createdById: null,
        updateDate: null,
        updateByName: null,
        updateById: null,
        approvedDate: null,
        approvedByName: null,
        approvedById: null,
        cancelDate: null,
        cancelByName: null,
        cancelById: null,
        approvedMemo: null,
        printedStatus: null,
        printedDate: null,
        printedBy: null,
        cancelMemo: null
    };
};
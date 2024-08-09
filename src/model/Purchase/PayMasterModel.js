import moment from 'moment';

import {
    formatThaiDateUi,
    getCreateDateTime
} from '../../utils/SamuiUtils';

export const payMasterModel = () => {
    return {
        // สำหรับตารางจ่าย
        datePay: formatThaiDateUi(moment()),
        amountPay: 0,

        // ข้อมูลทั่วไป
        payId: null,
        payNo: null,
        payDate: formatThaiDateUi(moment()),
        docDueDate: formatThaiDateUi(moment()),
        payStatus: null,
        payType: 1,
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
        createdDate: getCreateDateTime(),
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
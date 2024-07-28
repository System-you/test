import Axios from "axios";
import Swal from "sweetalert2";

// ดึงข้อมูลจาก Table ใดๆ ก็ได้
const getAllData = async (table, order) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-all-data`, {
            table: table,
            order: order,
            comp_id: window.localStorage.getItem('company')
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const getByDocId = async (table, docId, andOrder) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-doc-id`, {
            table: table,
            doc_id: docId,
            and_order: andOrder
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

// ดึงข้อมูลจาก Tb_Set_Company
const getCompany = async () => {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/api/get-company`, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก Tb_Set_DocType
const getDocType = async () => {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/api/get-doc-type`, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก Tb_Set_TransType
const getTransType = async () => {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/api/get-trans-type`, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก Tb_Set_DocStatusColour
const getDocStatusColour = async (docCode, docField) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-doc-status-colour`, {
            doc_code: docCode,
            doc_field: docField
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก View_Set_Pr
const getViewPrH = async () => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-view-pr-h`, {
            comp_id: window.localStorage.getItem('company')
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก View_Set_Po
const getViewPoH = async () => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-view-po-h`, {
            comp_id: window.localStorage.getItem('company')
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก View_Set_Ap
const getViewAp = async () => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-view-ap`, {
            comp_id: window.localStorage.getItem('company')
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// ดึงข้อมูลจาก View_Set_Item
const getViewItem = async () => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-view-item`, {
            comp_id: window.localStorage.getItem('company')
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Popup แจ้งเตือน ต่างๆ ใช้ status = OK, FAILED
const getAlert = (status, message) => {

    let icon = "";
    let confirmButtonClass = "";

    switch (status) {
        case 'OK':
            icon = "success";
            confirmButtonClass = "btn btn-success";
            break;
        case 'FAILED':
            icon = "error";
            confirmButtonClass = "btn btn-danger";
            break;
        case 'WARNING':
            icon = "warning";
            confirmButtonClass = "btn btn-warning";
            break;
        case 'INFO':
            icon = "info";
            confirmButtonClass = "btn btn-info";
            break;
        default:
            console.error(`Invalid status: ${status}`);
            return;
    }

    Swal.fire({
        title: message,
        icon: icon,
        buttonsStyling: false,
        customClass: {
            confirmButton: confirmButtonClass
        }
    });
};

// ฟังก์ชันสำหรับจัดรูปแบบจำนวนเงิน
const formatCurrency = (amount) => {
    // ตรวจสอบว่ามีค่าและไม่เป็น NaN หรือ null
    if (amount == null || isNaN(amount)) {
        return "0.00";
    }

    // แปลงจำนวนเงินให้เป็นทศนิยม 2 ตำแหน่งและเพิ่ม ,
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "dd/mm/yyyy"
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear() + 543;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "YYMMDDHHMMSSZZZ"
const formatDateTime = (date) => {
    const padZero = (number, length) => number.toString().padStart(length, '0');

    const year = date.getFullYear().toString().slice(2);  // ตัดเลขปีให้เหลือ 2 หลัก
    const month = padZero(date.getMonth() + 1, 2);  // เดือน
    const day = padZero(date.getDate(), 2);  // วัน
    const hours = padZero(date.getHours(), 2);  // ชั่วโมง
    const minutes = padZero(date.getMinutes(), 2);  // นาที
    const seconds = padZero(date.getSeconds(), 2);  // วินาที
    const milliseconds = padZero(date.getMilliseconds(), 3);  // มิลลิวินาที

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

// ฟังก์ชันเพื่อแปลงวันที่เป็นปี พ.ศ.
const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    const year = date.getFullYear() + 543;
    return `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "2567-07-18 00:00:00.000 เป็น 2024-07-18 00:00:00.000" เพื่อบันทึกลง Database
const formatThaiDateToDate = (date) => {
    if (!date || typeof date !== 'string') {
        //console.error('Invalid date format:', date);
        return null; // หรือทำการจัดการข้อผิดพลาดที่เหมาะสม
    }

    // แยกวันที่และเวลาจากสตริง
    const [datePart, timePart] = date.split(' ');

    if (!datePart) {
        //console.error('Date part is missing in:', date);
        return null;
    }

    // แยกปี, เดือน, และวัน
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
        //console.error('Incomplete date parts in:', date);
        return null;
    }

    // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
    const christianYear = Number(year) - 543;

    // ตรวจสอบว่าปี ค.ศ. ถูกต้องหรือไม่
    if (isNaN(christianYear)) {
        //console.error('Invalid year in date:', date);
        return null;
    }

    // รวมปี ค.ศ. เดือน วัน และเวลาเข้าด้วยกัน
    return timePart
        ? `${christianYear}-${month}-${day} ${timePart}`
        : `${christianYear}-${month}-${day}`;
};

// // GET Max ตามปีและเดือนของ DocNo, PayNo, RecNo, .... (จะเริ่มนับ 0001 ใหม่ ถ้าขึ้นเดือนใหม่)
// const getMaxNo = (list, prefix, prefixLength) => {
//     const currentYear = new Date().getFullYear().toString().slice(-2);
//     const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก
//     const initialNum = '0001'; // ค่าเริ่มต้นสำหรับหมายเลขแรก

//     if (list.length < 1) {
//         return prefix + currentYear + currentMonth + initialNum;
//     }

//     // หาหมายเลขสูงสุดจากรายการ
//     const maxNo = list.reduce((max, item) => {
//         return item.Doc_No > max ? item.Doc_No : max;
//     }, list[0].Doc_No);

//     // ตรวจสอบเดือนและปีของหมายเลขสูงสุด
//     const maxYear = maxNo.slice(prefixLength, prefixLength + 2);
//     const maxMonth = maxNo.slice(prefixLength + 2, prefixLength + 4);

//     // ถ้าเดือนหรือปีต่างจากเดือนปัจจุบัน ให้เริ่มหมายเลขใหม่
//     if (maxYear !== currentYear || maxMonth !== currentMonth) {
//         return prefix + currentYear + currentMonth + initialNum;
//     }

//     // เพิ่มหมายเลขและคืนค่าหมายเลขใหม่
//     const prefixPart = maxNo.slice(0, prefixLength);
//     const numPart = parseInt(maxNo.slice(prefixLength)) + 1;
//     const newNumber = prefixPart + numPart.toString().padStart(maxNo.length - prefixLength, '0');

//     return newNumber;
// };

// // SET DocNo ล่าสุด
// const getMaxDocNo = (list, title) => getMaxNo(list, title, 2);

// // SET PayNo ล่าสุด
// const getMaxPayNo = (list) => getMaxNo(list, "PAY", 6);

// // SET RecNo ล่าสุด
// const getMaxRecNo = (list) => getMaxNo(list, "REC", 6);

// SET DocNo ล่าสุด
const getMaxDocNo = (list, title) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก

    if (list.length < 1) { // เปลี่ยนจาก < 0 เป็น < 1 เพราะ list.length ไม่เคยเป็นค่าลบ
        return title + currentYear + currentMonth + "0001";
    }

    const maxDoc = list.reduce((max, item) => {
        return item.Doc_No > max ? item.Doc_No : max;
    }, list[0].Doc_No);

    return incrementDocNo(maxDoc);
};

const incrementDocNo = (docNo) => {
    const prefix = docNo.slice(0, 2);
    const numPart = parseInt(docNo.slice(2)) + 1;
    return prefix + numPart.toString().padStart(docNo.length - 2, '0');
};

// SET PayNo ล่าสุด
const getMaxPayNo = (list) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก

    if (list.length < 1) { // เปลี่ยนจาก < 0 เป็น < 1 เพราะ list.length ไม่เคยเป็นค่าลบ
        return `PAY${currentYear}${currentMonth}0001`;
    }

    const maxPay = list.reduce((max, item) => {
        return item.Pay_No > max ? item.Pay_No : max;
    }, list[0].Pay_No);

    return incrementPayNo(maxPay);
};

const incrementPayNo = (payNo) => {
    const prefix = payNo.slice(0, 6); // แยก prefix PAY6707
    const numPart = parseInt(payNo.slice(6)) + 1; // แยกเลขส่วนท้ายแล้วเพิ่ม 1
    return prefix + numPart.toString().padStart(4, '0'); // รวม prefix กับเลขที่ใหม่
};

// SET RecNo ล่าสุด
const getMaxRecNo = (list) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // แปลงเดือนเป็นเลขสองหลัก

    if (list.length < 1) { // เปลี่ยนจาก < 0 เป็น < 1 เพราะ list.length ไม่เคยเป็นค่าลบ
        return `REC${currentYear}${currentMonth}0001`;
    }

    const maxRec = list.reduce((max, item) => {
        return item.Rec_No > max ? item.Rec_No : max;
    }, list[0].Rec_No);

    return incrementRecNo(maxRec);
};

const incrementRecNo = (recNo) => {
    const prefix = recNo.slice(0, 6); // แยก prefix PAY6707
    const numPart = parseInt(recNo.slice(6)) + 1; // แยกเลขส่วนท้ายแล้วเพิ่ม 1
    return prefix + numPart.toString().padStart(4, '0'); // รวม prefix กับเลขที่ใหม่
};

// SET CreateDateTime
const getCreateDateTime = () => {
    const today = new Date();
    const year = today.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const formattedNewDate = `${day}-${month}-${year}`;
    const formattedTime = today.toTimeString().split(' ')[0]; // แยกเอาเฉพาะเวลา
    return `${formattedNewDate} ${formattedTime}`;
};

// Update Status ในข้อมูล
const updateStatusByNo = async (table, field, status, where) => {
    try {
        // ตรวจสอบข้อมูลก่อนส่งเพื่อป้องกันการโจมตี SQL Injection
        if (!table || !field || !status || !where) {
            console.error("Missing required fields");
            return null;
        }

        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-status`, {
            table: table,
            field: field,
            status: status,
            where: where
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

// Update Qty ในข้อมูล
const updateQty = async (table, updateCode, where) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-qty`, {
            table: table,
            update_code: updateCode,
            where: where
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

export {
    getAllData,
    getByDocId,
    getCompany,
    getDocType,
    getTransType,
    getDocStatusColour,
    getViewPrH,
    getViewPoH,
    getViewAp,
    getViewItem,
    getAlert,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatThaiDate,
    formatThaiDateToDate,
    getMaxDocNo,
    getMaxPayNo,
    getMaxRecNo,
    getCreateDateTime,
    updateStatusByNo,
    updateQty,
};
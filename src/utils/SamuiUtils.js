import Axios from "axios";
import Swal from "sweetalert2";
import moment from 'moment';

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

// ดึงข้อมูลจาก Table ใดๆ ก็ได้ โดยใช้ DocId
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

// ดึงข้อมูลจาก Table ใดๆ ก็ได้ โดยใช้ RecId
const getByRecId = async (table, recId, andOrder) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-by-rec-id`, {
            table: table,
            rec_id: recId,
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

    // เลื่อนหน้าขึ้นด้านบนสุด
    window.scrollTo(0, 0);

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
    // ตรวจสอบว่า amount เป็นประเภท number
    if (typeof amount !== 'number' || isNaN(amount)) {
        return "0.00";
    }

    // แปลงจำนวนเงินให้เป็นทศนิยม 2 ตำแหน่ง
    const formattedAmount = amount.toFixed(2);

    // ตรวจสอบว่ามีรูปแบบที่จัดรูปแบบแล้วอยู่หรือไม่
    const regex = /^\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/;
    // ตรวจสอบว่าค่าเป็นประเภท string และมีรูปแบบที่จัดรูปแบบแล้วหรือไม่
    if (regex.test(formattedAmount)) {
        return formattedAmount; // คืนค่าเดิมถ้ามีการ format เรียบร้อยแล้ว
    }

    // เพิ่ม , เพื่อจัดรูปแบบจำนวนเงิน
    return formattedAmount.replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

// ฟังก์ชันสำหรับแปลงรูปแบบจำนวนเงินกลับไปเป็นตัวเลขธรรมดา
const parseCurrency = (formattedAmount) => {
    // ตรวจสอบว่าค่าที่ได้รับเป็น string หรือไม่
    if (typeof formattedAmount !== 'string') {
        return formattedAmount; // คืนค่าเดิมถ้าไม่ใช่ string
    }

    // ตรวจสอบว่ามีค่าและไม่เป็น NaN หรือ null
    if (formattedAmount == null || isNaN(formattedAmount.replace(/,/g, ''))) {
        return formattedAmount; // คืนค่าเดิมถ้าไม่สามารถแปลงได้
    }

    // ตรวจสอบรูปแบบของจำนวนเงิน (เช่น "1,234,567.89")
    const regex = /^\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/;
    if (!regex.test(formattedAmount)) {
        return formattedAmount; // คืนค่าเดิมถ้ารูปแบบไม่ตรงตามที่คาดหวัง
    }

    // ลบเครื่องหมายพันหลัก (,)
    const numericValue = formattedAmount.replace(/,/g, '');

    // แปลงข้อความที่ได้เป็นจำนวนจริง
    return parseFloat(numericValue);
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "dd/mm/yyyy" เพื่อแปลงใส่ DatePicker
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear() + 543;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "07-08-2567 เป็น 2024-08-07 00:00:00.000" เพื่อบันทึกลง Database
const formatStringDateToDate = (dateString) => {
    // แยกวัน เดือน ปี จากสตริงวันที่
    const [day, month, buddhistYear] = dateString.split('-');

    // แปลงพุทธศักราชเป็นคริสต์ศักราช
    const christianYear = parseInt(buddhistYear, 10) - 543;

    // จัดรูปแบบวันที่เป็น "YYYY-MM-DD 00:00:00.000"
    const formattedDate = `${christianYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')} 00:00:00.000`;

    return formattedDate;
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "2024-08-06T17:00:00.000Z เป็น 06/08/2567" เพื่อส่งค่าไปที่ DatePicker
const formatDateToStringDate = (date) => {
    // สร้าง Date object จากสตริงวันที่ที่ได้รับมา
    const d = new Date(date);

    // รับค่าวัน, เดือน, ปี (ปี + 543 สำหรับปีพุทธศักราช)
    const day = ('0' + d.getUTCDate()).slice(-2);
    const month = ('0' + (d.getUTCMonth() + 1)).slice(-2); // เดือนใน JavaScript เริ่มต้นที่ 0
    const year = d.getUTCFullYear() + 543; // เพิ่ม 543 เพื่อให้เป็นปีพุทธศักราช

    // จัดรูปแบบวันที่เป็น dd/mm/yyyy
    return `${day}-${month}-${year}`;
};

const formatThaiDateUi = (dateString) => {
    if (dateString === null) {
        return null;
    } else if (dateString === '') {
        return '';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null; // คืนค่าเป็น null เมื่อวันที่ไม่ถูกต้อง
    }

    const year = date.getFullYear() + 543;
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${year}`;
};

// ฟังก์ชันเพื่อใช้กับ handleChangeDateMaster
const formatDateOnChange = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    const year = date.getFullYear();
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${year}`;
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

// ฟังก์ชันเพื่อแปลงวันที่เป็นปี พ.ศ. yyyy-mm-dd เพื่อแปลงใส่ DatePicker
const formatThaiDate = (dateString) => {
    // ตรวจสอบว่า dateString เป็น null หรือ string ว่าง
    if (dateString === null) {
        return null;
    }
    if (dateString === '') {
        return '';
    }

    // สร้างอ็อบเจ็กต์ Date จาก dateString
    const date = new Date(dateString);

    // ตรวจสอบว่าการสร้าง Date สำเร็จหรือไม่
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    // แปลงปี ค.ศ. เป็นปี พ.ศ.
    const year = date.getFullYear() + 543;

    // จัดรูปแบบวันที่ในรูปแบบ yyyy-mm-dd
    return `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// ฟังก์ชันสำหรับจัดรุปแบบวันที่ให้เป็น "18-07-2567 เป็น 2024-07-18 00:00:00.000" เพื่อบันทึกลง Database
const formatThaiDateUiToDate = (date) => {
    // ตรวจสอบว่า date มีค่าและเป็น string หรือไม่
    if (!date || typeof date !== 'string') {
        return null; // หรือทำการจัดการข้อผิดพลาดที่เหมาะสม
    }

    // แยกวันที่และเวลาจากสตริง
    const [datePart, timePart] = date.split(' ');

    if (!datePart) {
        return null;
    }

    // แยกปี, เดือน, และวัน
    const [day, month, year] = datePart.split('-');

    if (!day || !month || !year) {
        return null;
    }

    // ตรวจสอบและแปลงปีพุทธศักราชเป็นคริสต์ศักราช
    const christianYear = Number(year) - 543;

    // ตรวจสอบว่าปี ค.ศ. ถูกต้องหรือไม่
    if (isNaN(christianYear) || christianYear < 0) {
        return null;
    }

    // รวมปี ค.ศ. เดือน วัน และเวลาเข้าด้วยกัน
    return timePart
        ? `${christianYear}-${month}-${day} ${timePart}`
        : `${christianYear}-${month}-${day} 00:00:00.000`;
};

// ฟังก์ชั่นหลักเพื่อรับปีและเดือนปัจจุบันในปีพ.ศ.
const getCurrentYearMonth = () => {
    const currentYear = (new Date().getFullYear() + 543).toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return { currentYear, currentMonth };
};

// ฟังก์ชั่นเพิ่ม DocNo (For PR, PO)
const getMaxDocNo = (list, title) => {
    const { currentYear, currentMonth } = getCurrentYearMonth();

    if (!list || list.length < 1) { // ตรวจสอบกรณี list เป็น undefined, null, หรือไม่มีข้อมูล
        return title + currentYear + currentMonth + "0001";
    }

    const maxDoc = list.reduce((max, item) => {
        return item.Doc_No > max ? item.Doc_No : max;
    }, list[0].Doc_No);

    // เช็คปีและเดือนใน DocNo ล่าสุด
    if (maxDoc.slice(2, 4) !== currentYear || maxDoc.slice(4, 6) !== currentMonth) {
        return title + currentYear + currentMonth + "0001";
    }

    return incrementDocNo(maxDoc);
};
// ฟังก์ชั่นเพิ่มเสริม DocNo (For PR, PO)
const incrementDocNo = (docNo) => {
    const prefix = docNo.slice(0, 6); // รวมปีและเดือนใน prefix
    const numPart = parseInt(docNo.slice(6)) + 1;
    return prefix + numPart.toString().padStart(docNo.length - 6, '0');
};

// ฟังก์ชั่นเพิ่ม RecNo
const getMaxRecNo = (list) => {
    const { currentYear, currentMonth } = getCurrentYearMonth();

    if (!list || list.length < 1) { // ตรวจสอบกรณี list เป็น undefined, null, หรือไม่มีข้อมูล
        return `REC${currentYear}${currentMonth}0001`;
    }

    const maxRec = list.reduce((max, item) => {
        return item.Rec_No > max ? item.Rec_No : max;
    }, list[0].Rec_No);

    // เช็คปีและเดือนใน RecNo ล่าสุด
    if (maxRec.slice(3, 5) !== currentYear || maxRec.slice(5, 7) !== currentMonth) {
        return `REC${currentYear}${currentMonth}0001`;
    }

    return incrementRecNo(maxRec);
};
// ฟังก์ชั่นเพิ่มเสริม RecNo
const incrementRecNo = (recNo) => {
    const prefix = recNo.slice(0, 7); // รวมปีและเดือนใน prefix
    const numPart = parseInt(recNo.slice(7)) + 1;
    return prefix + numPart.toString().padStart(4, '0');
};

// ฟังก์ชั่นเพิ่ม PayNo
const getMaxPayNo = (list) => {
    const { currentYear, currentMonth } = getCurrentYearMonth();

    if (!list || list.length < 1) { // ตรวจสอบกรณี list เป็น undefined, null, หรือไม่มีข้อมูล
        return `PAY${currentYear}${currentMonth}0001`;
    }

    const maxPay = list.reduce((max, item) => {
        return item.Pay_No > max ? item.Pay_No : max;
    }, list[0].Pay_No);

    // เช็คปีและเดือนใน PayNo ล่าสุด
    if (maxPay.slice(3, 5) !== currentYear || maxPay.slice(5, 7) !== currentMonth) {
        return `PAY${currentYear}${currentMonth}0001`;
    }

    return incrementPayNo(maxPay);
};
// ฟังก์ชั่นเพิ่มเสริม PayNo
const incrementPayNo = (payNo) => {
    const prefix = payNo.slice(0, 7); // รวมปีและเดือนใน prefix
    const numPart = parseInt(payNo.slice(7)) + 1;
    return prefix + numPart.toString().padStart(4, '0');
};

// ฟังก์ชั่นดึง Max ของ Line
const getLineByDocId = async (table, docId) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/get-line-by-doc-id`, {
            table: table,
            doc_id: docId
        }, {
            headers: { key: 'SAMUI1WoV5UbrGPq5iOXS2SS4ODR9999' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
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

const setCreateDateTime = (date) => {
    // ตรวจสอบว่า date เป็น null
    if (date === null) {
        return null;
    }

    // ตรวจสอบว่า date เป็น string ว่าง
    if (date === '') {
        return '';
    }

    // สร้างอ็อบเจ็กต์ Date จาก date
    const today = new Date(date);

    // แปลงเป็นปีพุทธศักราช
    const year = today.getUTCFullYear() + 543;
    const day = today.getUTCDate().toString().padStart(2, '0');
    const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
    const formattedNewDate = `${day}-${month}-${year}`;

    // จัดรูปแบบเวลา
    const hours = today.getUTCHours().toString().padStart(2, '0');
    const minutes = today.getUTCMinutes().toString().padStart(2, '0');
    const seconds = today.getUTCSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // คืนค่าที่จัดรูปแบบแล้ว
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

// Delete ข้อมูลด้วย Table, Where
const deleteDetail = async (table, where) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/delete`, {
            table: table,
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
    getByRecId,
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
    parseCurrency,
    formatDate,
    formatStringDateToDate,
    formatDateToStringDate,
    formatDateTime,
    formatThaiDate,
    formatThaiDateUi,
    formatDateOnChange,
    formatThaiDateToDate,
    formatThaiDateUiToDate,
    getMaxDocNo,
    getMaxRecNo,
    getMaxPayNo,
    getLineByDocId,
    getCreateDateTime,
    setCreateDateTime,
    updateStatusByNo,
    updateQty,
    deleteDetail,
};
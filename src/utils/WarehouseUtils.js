import Axios from "axios";

// Update ข้อมูล ใน Table : WH_ITEM_Onhand (ทดลองสร้างเป็นตัวกลาง อาจจะมีปรับเปลี่ยนบ่อย อย่าเพิ่งเอาไปใช้) Create By SpriteZadis
const updateWhItemOnHand = async (lastQty, itemOnHand, lastStcSeq, lastStcDate, itemId, whId) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/update-wh-item-on-hand`, {
            last_qty: lastQty,
            item_on_hand: itemOnHand,
            last_stc_seq: lastStcSeq,
            last_stc_date: lastStcDate,
            item_id: itemId,
            wh_id: whId,
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

// Insert ข้อมูล ใน Table : WH_ITEM_STC (ทดลองสร้างเป็นตัวกลาง อาจจะมีปรับเปลี่ยนบ่อย อย่าเพิ่งเอาไปใช้) Create By SpriteZadis
const insertWhItemStc = async (
    itemId,
    itemCode,
    itemName,
    docType,
    refBalance,
    stcQty,
    stcBalance,
    stcDate,
    stcBy,
    docId,
    docNo,
    docNoRef,
    stcRemark,
    stcSeq,
    whId,
    zoneId,
    ltId
) => {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/insert-wh-item-stc`, {
            item_id: itemId,
            item_code: itemCode,
            item_name: itemName,
            doc_type: docType,
            ref_balance: refBalance,
            stc_qty: stcQty,
            stc_balance: stcBalance,
            stc_date: stcDate,
            stc_by: stcBy,
            comp_id: window.localStorage.getItem('company'),
            doc_id: docId,
            doc_no: docNo,
            doc_noref: docNoRef,
            stc_remark: stcRemark,
            stc_seq: stcSeq,
            wh_id: whId,
            zone_id: zoneId,
            lt_id: ltId
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
    updateWhItemOnHand,
    insertWhItemStc
};
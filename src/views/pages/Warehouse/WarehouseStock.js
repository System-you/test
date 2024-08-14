import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
// import Main from '../../components/Warehouse/WarehouseStock/Main';
import Form from '../../components/Warehouse/WarehouseStock/Form';
import { getAllData, getAlert } from '../../../utils/SamuiUtils';

function WarehouseStock() {
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);

  // ข้อมูล OnHand & warehouseId
  const [apiOnHand, setApiOnHand] = useState([]);

  // ข้อมูลตั้งต้น
  const [tbSetWh, setTbSetWh] = useState([]);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      fetchRealtime(); // เรียกใช้งาน fetchRealtime เพื่อโหลดข้อมูลเมื่อ component โหลดครั้งแรก
    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  const fetchRealtime = async () => {
    try {
      // API_0002_Set_Item
      const masterList = await getAllData('API_0002_Set_Item', `ORDER BY Item_Code ASC`);
      if (masterList && masterList.length > 0) {
        setDataMasterList(masterList);
      }

      // API_1101_WH_ITEM_ONHAND
      const apiOnHandAll = await getAllData('API_1101_WH_ITEM_ONHAND', 'ORDER BY WH_Name, Item_Code');
      if (apiOnHandAll && apiOnHandAll.length > 0) {
        setApiOnHand(apiOnHandAll);
      }

      // Tb_Set_WH (ข้อมูลตั้งต้น)
      const resultWh = await getAllData('Tb_Set_WH', 'ORDER BY WH_Id ASC');
      if (resultWh && resultWh.length > 0) {
        setTbSetWh(resultWh);
      }

    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  return (
    <div className="WarehouseStock">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <Form
                name={'สต็อกคลังสินค้า'}
                masterList={dataMasterList}
                tbSetWh={tbSetWh}
                apiOnHand={apiOnHand}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WarehouseStock;

import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/Purchase/ProductReceipt/DataTable';
import Form from '../../components/Purchase/ProductReceipt/Form';
import { getAllData, getDocStatusColour, getAlert, getMaxRecNo } from '../../../utils/SamuiUtils';

function ProductReceipt() {
  const [mode, setMode] = useState('');
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);
  const [statusColours, setStatusColours] = useState([]);
  const [maxRecNo, setMaxRecNo] = useState();

  useEffect(() => {
    initialize();
  }, []);

  const fetchRealtime = async () => {
    try {
      const masterList = await getAllData('View_REC_NetTotal', 'ORDER BY Rec_No DESC');
      // const detailList = await getAllData('View_REC_NetTotal_Detial', '');
      const docStatusColour = await getDocStatusColour('POREC', 'Rec_Status');

      if (masterList && masterList.length > 0) {
        const sortedData = masterList.sort((a, b) => a.Rec_No - b.Rec_No);
        setDataMasterList(sortedData, "REC");

        // หาค่าสูงของ DocNo ใน API_101_PR_H
        const maxRec = getMaxRecNo(sortedData);
        setMaxRecNo(maxRec);
      } else {
        const currentYear = new Date().getFullYear();
        const thaiYear = currentYear + 543; // Convert to Thai year (พ.ศ.)
        const maxRecNo = "REC" + thaiYear.toString().slice(-2) + "07" + "0001";
        setMaxRecNo(maxRecNo);
      }

      // if (detailList && detailList.length > 0) {
      //   setDataDetailList(detailList);
      // }

      if (docStatusColour && docStatusColour.length > 0) {
        setStatusColours(docStatusColour);
      }
    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  const initialize = async () => {
    try {
      setMode('S');
      fetchRealtime(); // เรียกใช้งาน fetchRealtime เพื่อโหลดข้อมูลเมื่อ component โหลดครั้งแรก
    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  const onPageInsert = () => {
    setMode('I')
  };

  const onRowSelected = (recNo) => {
    setMaxRecNo(recNo);
    setMode('U');
  };

  return (
    <div className="PurchaseOrder">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              {mode === 'S' ? (
                <DataTable
                  masterList={dataMasterList}
                  detailList={dataDetailList}
                  statusColours={statusColours}
                  name={'ใบรับสินค้า'}
                  onPageInsert={() => onPageInsert()}
                  onRowSelected={(recNo) => onRowSelected(recNo)}
                />
              ) : (
                <Form callInitialize={initialize} mode={mode} name={'ใบรับสินค้า'} maxRecNo={maxRecNo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductReceipt;

import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Purchase/ProductReceipt/Main';
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
      const masterList = await getAllData('API_0301_REC_H', 'ORDER BY Rec_No DESC');
      // const detailList = await getAllData('API_0302_REC_D', '');
      const docStatusColour = await getDocStatusColour('POREC', 'Rec_Status');

      if (masterList && masterList.length > 0) {
        const sortedData = masterList.sort((a, b) => a.Rec_No - b.Rec_No);
        setDataMasterList(sortedData);
      }

      // if (detailList && detailList.length > 0) {
      //   setDataDetailList(detailList);
      // }

      if (docStatusColour && docStatusColour.length > 0) {
        setStatusColours(docStatusColour);
      }

      // หาค่าสูงของ RecNo ใน REC_H
      const findMaxRecNo = await getAllData('REC_H', 'ORDER BY Rec_No DESC');
      const maxRec = getMaxRecNo(findMaxRecNo);
      setMaxRecNo(maxRec);
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
                <Main
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

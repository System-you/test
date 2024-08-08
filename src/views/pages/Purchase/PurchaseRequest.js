import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Purchase/PurchaseRequest/Main';
import Form from '../../components/Purchase/PurchaseRequest/Form';
import { getAllData, getDocStatusColour, getAlert, getMaxDocNo } from '../../../utils/SamuiUtils';

function PurchaseRequest() {
  const [mode, setMode] = useState('');
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);
  const [statusColours, setStatusColours] = useState([]);
  const [maxDocNo, setMaxDocNo] = useState();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setMode('S');
      fetchRealtime(); // เรียกใช้งาน fetchRealtime เพื่อโหลดข้อมูลเมื่อ component โหลดครั้งแรก
    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  const fetchRealtime = async () => {
    try {
      const masterList = await getAllData('API_0101_PR_H', 'ORDER BY Doc_No DESC');
      // const detailList = await getAllData('API_0102_PR_D', '');
      const docStatusColour = await getDocStatusColour('PR', 'Doc_Status');

      if (masterList && masterList.length > 0) {
        const sortedData = masterList.sort((a, b) => a.Doc_Id - b.Doc_Id);
        setDataMasterList(sortedData);
      }

      // if (detailList && detailList.length > 0) {
      //   setDataDetailList(detailList);
      // }

      if (docStatusColour && docStatusColour.length > 0) {
        setStatusColours(docStatusColour);
      }

      // หาค่าสูงของ DocNo ใน PR_H
      const findMaxDocNo = await getAllData('PR_H', 'ORDER BY Doc_No DESC');
      const maxDoc = getMaxDocNo(findMaxDocNo, 'PR');
      setMaxDocNo(maxDoc);
    } catch (error) {
      getAlert('FAILED', error.message);
    }
  };

  const onPageInsert = () => {
    setMode('I')
  };

  const onRowSelected = (docNo) => {
    setMaxDocNo(docNo);
    setMode('U');
  };

  return (
    <div className="PurchaseRequest">
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
                  name={'ใบขอซื้อ'}
                  onPageInsert={() => onPageInsert()}
                  onRowSelected={(docNo) => onRowSelected(docNo)}
                />
              ) : (
                <Form callInitialize={initialize} mode={mode} name={'ใบขอซื้อ'} maxDocNo={maxDocNo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseRequest;

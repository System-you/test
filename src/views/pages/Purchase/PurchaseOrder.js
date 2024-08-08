import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Purchase/PurchaseOrder/Main';
import Form from '../../components/Purchase/PurchaseOrder/Form';
import { getAllData, getDocStatusColour, getAlert, getMaxDocNo } from '../../../utils/SamuiUtils';

function PurchaseOrder() {
  const [mode, setMode] = useState('');
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);
  const [statusColours, setStatusColours] = useState([]);
  const [statusPaidColours, setStatusPaidColours] = useState([]);
  const [statusReceiveColours, setStatusReceiveColours] = useState([]);
  const [maxDocNo, setMaxDocNo] = useState();

  useEffect(() => {
    initialize();
  }, []);

  const fetchRealtime = async () => {
    try {
      const masterList = await getAllData('API_0201_PO_H', 'ORDER BY Doc_No DESC');
      // const detailList = await getAllData('API_0202_PO_D', '');
      const docStatusColour = await getDocStatusColour('PO', 'Doc_Status');
      const docStatusPaidColour = await getDocStatusColour('PO', 'Doc_Status_Paid');
      const docStatusReceiveColour = await getDocStatusColour('PO', 'Doc_Status_Receive');

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

      if (docStatusPaidColour && docStatusPaidColour.length > 0) {
        setStatusPaidColours(docStatusPaidColour);
      }

      if (docStatusReceiveColour && docStatusReceiveColour.length > 0) {
        setStatusReceiveColours(docStatusReceiveColour);
      }

      // หาค่าสูงของ DocNo ใน PO_H
      const findMaxDocNo = await getAllData('PO_H', 'ORDER BY Doc_No DESC');
      const maxDoc = getMaxDocNo(findMaxDocNo, 'PO');
      setMaxDocNo(maxDoc);
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

  const onRowSelected = (docNo) => {
    setMaxDocNo(docNo);
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
                  statusPaidColours={statusPaidColours}
                  statusReceiveColours={statusReceiveColours}
                  name={'ใบสั่งซื้อ'}
                  onPageInsert={() => onPageInsert()}
                  onRowSelected={(docNo) => onRowSelected(docNo)}
                />
              ) : (
                <Form callInitialize={initialize} mode={mode} name={'ใบสั่งซื้อ'} maxDocNo={maxDocNo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrder;

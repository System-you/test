import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/Purchase/PaymentVoucher/DataTable';
import Form from '../../components/Purchase/PaymentVoucher/Form';
import { getAllData, getDocStatusColour, getAlert, getMaxPayNo } from '../../../utils/SamuiUtils';

function PaymentVoucher() {
  const [mode, setMode] = useState('');
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);
  const [statusColours, setStatusColours] = useState([]);
  const [maxDocNo, setMaxDocNo] = useState();

  useEffect(() => {
    initialize();
  }, []);

  const fetchRealtime = async () => {
    try {
      const masterList = await getAllData('API_0401_PAY_H', 'ORDER BY Pay_No DESC');
      // const detailList = await getAllData('API_0402_PAY_D', '');
      const payStatusColour = await getDocStatusColour('PAYPO', 'Pay_Status');

      if (masterList && masterList.length > 0) {
        const sortedData = masterList.sort((a, b) => a.Pay_No - b.Pay_No);
        setDataMasterList(sortedData, "PAY");

        // หาค่าสูงของ DocNo ใน API_101_PR_H
        const maxDoc = getMaxPayNo(sortedData);
        setMaxDocNo(maxDoc);
      } else {
        const currentYear = new Date().getFullYear();
        const thaiYear = currentYear + 543; // Convert to Thai year (พ.ศ.)
        const maxDocNo = "PAY" + thaiYear.toString().slice(-2) + "07" + "0001";
        setMaxDocNo(maxDocNo);
      }

      // if (detailList && detailList.length > 0) {
      //   setDataDetailList(detailList);
      // }

      if (payStatusColour && payStatusColour.length > 0) {
        setStatusColours(payStatusColour);
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

  const onRowSelected = (docNo) => {
    setMaxDocNo(docNo);
    setMode('U');
  };

  return (
    <div className="PaymentVoucher">
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
                  name={'ใบสำคัญจ่าย'}
                  onPageInsert={() => onPageInsert()}
                  onRowSelected={(docNo) => onRowSelected(docNo)}
                />
              ) : (
                <Form callInitialize={initialize} mode={mode} name={'ใบสำคัญจ่าย'} maxDocNo={maxDocNo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentVoucher;

import React, { useState, useEffect } from 'react';

// Components
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Purchase/PaymentVoucher/Main';
import Form from '../../components/Purchase/PaymentVoucher/Form';
import { getAllData, getDocStatusColour, getAlert, getMaxPayNo } from '../../../utils/SamuiUtils';

function PaymentVoucher() {
  const [mode, setMode] = useState('');
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataDetailList, setDataDetailList] = useState([]);
  const [statusColours, setStatusColours] = useState([]);
  const [maxPayNo, setMaxPayNo] = useState();

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
        setDataMasterList(sortedData);
      }

      // if (detailList && detailList.length > 0) {
      //   setDataDetailList(detailList);
      // }

      if (payStatusColour && payStatusColour.length > 0) {
        setStatusColours(payStatusColour);
      }

      // หาค่าสูงของ PayNo ใน PAY_H
      const findMaxPayNo = await getAllData('PAY_H', 'ORDER BY Pay_No DESC');
      const maxPay = getMaxPayNo(findMaxPayNo);
      setMaxPayNo(maxPay);
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

  const onRowSelected = (payNo) => {
    setMaxPayNo(payNo);
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
                <Main
                  masterList={dataMasterList}
                  detailList={dataDetailList}
                  statusColours={statusColours}
                  name={'ใบสำคัญจ่าย'}
                  onPageInsert={() => onPageInsert()}
                  onRowSelected={(payNo) => onRowSelected(payNo)}
                />
              ) : (
                <Form callInitialize={initialize} mode={mode} name={'ใบสำคัญจ่าย'} maxPayNo={maxPayNo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentVoucher;

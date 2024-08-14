import { useState } from "react";
import Breadcrumbs from "../../Breadcrumbs";
// React DateTime
import Datetime from 'react-datetime';
import moment from 'moment';
import { formatDateOnChange } from "../../../../utils/SamuiUtils";
import TreasuryDocumentsSearch from "../../Modal/TreasuryDocumentsSearch";

const Main = ({ name, onChangeMode }) => {
  const [formMasterList, setFormMasterList] = useState({
    recDueDate: moment()
  });


  // Modal Search
  const [showModalSearch, setShowModalSearch] = useState(false);
  const handleShowSearch = () => setShowModalSearch(true);
  const handleCloseSearch = () => setShowModalSearch(false);


  const handleChangeDateMaster = (value, name) => {
    // ตรวจสอบว่า value เป็น moment object หรือไม่
    const newValue = value && value instanceof moment ? value.format('YYYY-MM-DD') : value;

    // อัปเดตค่าใน formMasterList
    setFormMasterList((prev) => ({
      ...prev,
      [name]: formatDateOnChange(newValue),
    }));
  };

  return <>
    <Breadcrumbs page={'ปรับปรุงสินค้า'} items={[
      { name: 'คลังสินค้า', url: '/Warehouse' },
      { name: name, url: '/treasury-documents' },
      { name: "สร้าง" + name, url: '#' },
    ]} />
    {/*  */}
    <div className="container-fluid card py-3">
      <div className="row mb-3  justify-content-between align-items-center">
        <div className="col-2">
          <div className="d-flex">
            <button
              className="btn text-white"
              onClick={onChangeMode("FD")}
              style={{
                backgroundColor: 'rgb(239, 108, 0)',
                whiteSpace: 'nowrap',
                padding: '10px',
                fontSize: '15px'
              }}
            >
              <i className="fa fa-plus" aria-hidden="true"></i> สร้างใบปรับปรุงสินค้า
            </button>
            <button
              className="btn text-white mx-3"
              onClick={onChangeMode("TF")}
              style={{
                backgroundColor: 'rgb(239, 108, 0)',
                whiteSpace: 'nowrap',
                padding: '10px',
                fontSize: '15px'
              }}
            >
              <i className="fa fa-plus" aria-hidden="true"></i> สร้างใบโอนย้าย
            </button>
          </div>
        </div>
        <div className="col-3 mx-1">
          <div className="d-flex">
            <div className="input-group">
              <span className="input-group-text">Search:</span>
              <input type="text" className="form-control" placeholder="คำค้นหา" />
              <button className="btn btn-outline-secondary" type="button" onClick={handleShowSearch}>
                <i className="fas fa-search"></i>
              </button>
              <TreasuryDocumentsSearch showModalSearch={showModalSearch} handleCloseSearch={handleCloseSearch} />
            </div>
          </div>
        </div>
        <div className="col-2 ">
          <div className="radio-inline">
            <input
              className="form-check-input"
              type="radio"
              name="paymentStatus"
              value=""

            />
            <label className="form-check-label">ใบรับสินค้า</label>
            <input
              className="form-check-input"
              type="radio"
              name="paymentStatus"
              value=""

            />
            <label className="form-check-label">ใบโอนสินค้า</label>
          </div>
        </div>
        <div className="col-4">
          <div className="d-flex">
            <label>จากวันที่เอกสาร : </label>
            <Datetime
              name="recDueDate"
              value={formMasterList.recDueDate || null}
              onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
              dateFormat="DD-MM-YYYY"
              timeFormat={false}
              inputProps={{ readOnly: true, disabled: false }}
            />
            <label className="text-center"> ถึง : </label>
            <Datetime
              name="recDueDate"
              value={formMasterList.recDueDate || null}
              onChange={(date) => handleChangeDateMaster(date, 'recDueDate')}
              dateFormat="DD-MM-YYYY"
              timeFormat={false}
              inputProps={{ readOnly: true, disabled: false }}
            />
            <button
              className="btn btn-outline-secondary ms-1"
              type="button"
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div className="row ">
        <div className="col-2 mb-1" style={{ borderRight: '2px solid #c7c8c9' }}>
          <div className="table-responsive">
            <table id="basic-datatables" className="table table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th className="text-center" style={{ width: '15%' }}>เลขเอกสาร</th>
                  <th className="text-center" style={{ width: '15%' }}>ประเภท</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center">ADJ6707002</td>
                  <td className="text-center">Adjust</td>
                </tr>
                {/* <tr>
                    <td colSpan={2}>
                      <div className="text-center">
                        <h5>ไม่พบข้อมูล</h5>
                      </div>
                    </td>
                  </tr> */}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-10 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="card-title mb-0">
              เอกสารเลขที่: ADJ6123123 จากคลัง: 001 คลัง LMI ไปยังคลัง: 001 คลัง LMI
            </p>
            <button className="btn d-flex align-items-center text-white" style={{
              backgroundColor: 'rgb(239, 108, 0)',
              fontSize: '16px'
            }}>
              <i className="fa fa-print me-2" aria-hidden="true"></i>
              พิมพ์ใบปรับยอด
            </button>
          </div>
          <div className="table-responsive">
            <table id="basic-datatables" className="table table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th className="text-center" style={{ width: '3%' }}>ลำดับ</th>
                  <th className="text-center" style={{ width: '7%' }}>Item_Code</th>
                  <th className="text-center" style={{ width: '15%' }}>Item_Name</th>
                  <th className="text-center" style={{ width: '3%' }}>จำนวน</th>
                  <th className="text-center" style={{ width: '3%' }}>หน่วย</th>
                  <th className="text-center" style={{ width: '5%' }}>ราคา/หน่วย</th>
                  <th className="text-center" style={{ width: '3%' }}>รวมเงิน</th>
                  <th className="text-center" style={{ width: '3%' }}>AI/AO</th>
                  <th className="text-center" style={{ width: '8%' }}>หมายเหตุ</th>
                  <th className="text-center" style={{ width: '4%' }}>จากคลัง</th>
                  <th className="text-center" style={{ width: '6%' }}>วันที่จัดส่ง</th>
                  <th className="text-center" style={{ width: '6%' }}>ไปยังคลัง</th>
                  <th className="text-center" style={{ width: '4%' }}>รหัสลูกค้า</th>
                  <th className="text-center" style={{ width: '5%' }}>ชื่อลูกค้า</th>
                </tr>
              </thead>
              <tbody>
                <tr >
                  <td className="text-center">1</td>
                  <td className="text-center">0500010DOE</td>
                  <td className="">แบบเรียน กข.</td>
                  <td className="text-center">100</td>
                  <td className="text-center">ชิ้น</td>
                  <td className="text-center">50.00</td>
                  <td className="text-center">5000.00</td>
                  <td className="text-center">AI</td>
                  <td className="text-center">สาขาเขตสำโรง</td>
                  <td className="text-center">Warehouse</td>
                  <td className="text-center">2024-08-10</td>
                  <td className="text-center">Warehouse</td>
                  <td className="text-center">CUST001</td>
                  <td className="text-center">Customer A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

  </>;
};

export default Main;

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from "axios";

// CSS
import '../../assets/css/components/sidebar.css';

// Utils
import { getAlert } from '../../utils/SamuiUtils';

function Sidebar() {
  const [authData, setAuthData] = useState([]);

  const location = useLocation();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/authen`, {}, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          key: process.env.REACT_APP_ANALYTICS_KEY
        }
      });
      if (response.data.status === 'OK') {
        setAuthData(response.data.decoded);
      } else {
        getAlert('FAILED', "Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาล็อกอินใหม่อีกครั้ง");

        // เพิ่ม Delay 2 วินาที ก่อนที่จะเปลี่ยนเส้นทาง
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      }
    } catch (error) {
      getAlert('FAILED', error.message);

      // เพิ่ม Delay 2 วินาที ก่อนที่จะเปลี่ยนเส้นทาง
      setTimeout(() => {
        window.location.replace('/login');
      }, 2000);
    }
  };

  return (
    <>
      <div className="sidebar" data-background-color="dark">
        <div className="sidebar-logo">
          <div className="logo-header" data-background-color="dark">
            <a onClick={() => window.location.replace('/')} className="logo">
              <img src="assets/img/logo_light.png" alt="Logo Light" className="navbar-brand" width={110} />
            </a>
          </div>
        </div>
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
              <li className="nav-item topbar-user dropdown hidden-caret">
                <center>
                  <button
                    style={{
                      marginLeft: '10px',
                      marginBottom: '10px',
                      textAlign: 'center',
                      color: '#EF6C00',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    className="btn dropdown-toggle profile-pic"
                    data-bs-toggle="modal"
                    data-bs-target="#profileModal"
                  >
                    <p className="text-white" style={{ margin: 0 }}>
                      <strong>{authData.Emp_Name || ''}</strong>
                    </p>
                    <i className="fa fa-chevron-down ms-2 text-white" style={{ fontSize: '10px' }}></i>
                  </button>
                  <p className="text-white text-center" style={{ marginTop: '-20px' }}>
                    <strong>( {authData.Comp_ShortName || ''} )</strong>
                  </p>
                </center>
              </li>
              <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <a href="/" className="collapsed">
                  <i className="fas fa-home" style={{ color: 'white' }} />
                  <p>Dashboard</p>
                </a>
              </li>
              <li className={`nav-item ${['/deposit-slip', '/purchase-request', '/purchase-order', '/product-receipt', '/payment-voucher', '/purchase-list'].includes(location.pathname) ? 'active' : ''} text-white`}>
                <a href="/purchase" className="collapsed" aria-expanded="false">
                  <i className="fas fa-shopping-cart" style={{ color: 'white' }} />
                  <p>จัดซื้อสินค้า</p>
                  <span className="caret" />
                </a>
                <div className={`collapse ${['/purchase', '/deposit-slip', '/purchase-request', '/purchase-order', '/product-receipt', '/payment-voucher', '/purchase-list'].includes(location.pathname) ? 'show' : ''}`} id="data">
                  <ul className="nav nav-collapse">
                    <li className={`nav-item ${location.pathname === '/deposit-slip' ? 'active' : ''}`}>
                      <a href="/deposit-slip">
                        <span className="sub-item">ใบมัดจำ</span>
                      </a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/purchase-request' ? 'active' : ''}`}>
                      <a href="/purchase-request">
                        <span className="sub-item">ใบขอซื้อ</span>
                      </a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/purchase-order' ? 'active' : ''}`}>
                      <a href="/purchase-order">
                        <span className="sub-item">ใบสั่งซื้อ</span>
                      </a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/product-receipt' ? 'active' : ''}`}>
                      <a href="/product-receipt">
                        <span className="sub-item">ใบรับสินค้า</span>
                      </a>
                    </li>
                    <li className={`nav-item ${location.pathname === '/payment-voucher' ? 'active' : ''}`}>
                      <a href="/payment-voucher">
                        <span className="sub-item">ใบสำคัญจ่าย</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className={`nav-item ${['/warehouse-stock'].includes(location.pathname) ? 'active' : ''} text-white`}>
                <a href="/warehouse" className="collapsed" aria-expanded="false">
                  <i className="fas fa-building" style={{ color: 'white' }} />
                  <p>คลังสินค้า</p>
                  <span className="caret" />
                </a>
                <div className={`collapse ${['/warehouse', '/warehouse-stock'].includes(location.pathname) ? 'show' : ''}`} id="data">
                  <ul className="nav nav-collapse">
                    <li className={`nav-item ${location.pathname === '/warehouse-stock' ? 'active' : ''}`}>
                      <a href="/warehouse-stock">
                        <span className="sub-item">สต็อกคลังสินค้า</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div >
      {/* Modal */}
      <div className="modal fade" id="profileModal" tabIndex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="profileModalLabel">User Profile</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="user-box">
                <div className="u-text">
                  <h4>{authData.Emp_Name}</h4>
                  <p className="text-muted">{authData.Dept_Name || ''}</p>
                  <p className="text-muted">{authData.PST_Name || ''}</p>
                  <p className="text-muted">{authData.Comp_Name_TH || ''}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => window.location.replace('/login')}
                className="btn btn-danger w-100">Logout</button>
            </div>
          </div>
        </div>
      </div >
    </>
  );
}

export default Sidebar;
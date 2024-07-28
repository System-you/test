import React from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

function Purchase() {
  const renderCard = (category, icon, newItems, additionalInfo, path) => (
    <div className="col-sm-6 col-md-2" style={{ cursor: 'pointer' }} onClick={() => window.location.replace(path)}>
      <div className="card card-stats card-round">
        <div className="card-body d-flex flex-column align-items-center">
          <div className="col-icon mb-3">
            <div className="icon-big text-center icon-secondary bubble-shadow-small" style={{ backgroundColor: 'orange' }}>
              <i className={icon} />
            </div>
          </div>
          <div className="col col-stats text-center">
            <div className="numbers">
              <p className="card-category">{category}</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                <li style={{ color: 'orange' }}>{newItems} รายการใหม่</li>
              </ul>
            </div>
          </div>
          <div className="col col-stats text-center">
            <div className="row">
              {additionalInfo.map((item, index) => (
                <div key={index} className="col-4" style={{ color: 'gray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="far fa-clock" aria-hidden="true" style={{ fontSize: '15px', marginRight: '5px' }}></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="Purchase">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={"จัดซื้อสินค้า"} items={[
                  { name: 'จัดซื้อสินค้า', url: '/purchase' },
                ]} />
              </div>
              <div className="row">
                {renderCard('ใบมัดจำ', 'far fa-file-alt', 1, [5, 0, 0], '/deposit-slip')}
                {/* ใบขอซื้อ */}
                <div className="col-sm-6 col-md-2" style={{ cursor: 'pointer' }} onClick={() => window.location.replace('/purchase-request')}>
                  <div className="card card-stats card-round">
                    <div className="card-body d-flex flex-column align-items-center">
                      <div className="col-icon mb-3">
                        <div className="icon-big text-center icon-secondary bubble-shadow-small" style={{ backgroundColor: 'orange' }}>
                          <i className="fas fa-luggage-cart" />
                        </div>
                      </div>
                      <div className="col col-stats text-center">
                        <div className="numbers">
                          <p className="card-category">ใบขอซื้อ</p>
                          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                            <li style={{ color: 'orange' }}>2 รายการใหม่</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col col-stats text-center">
                        <div className="row">
                          <div className="col-6 d-flex justify-content-center align-items-center" style={{ color: 'gray' }}>
                            <span style={{ whiteSpace: 'nowrap' }}>5 รออนุมัติ</span>
                          </div>
                          <div className="col-6 d-flex justify-content-center align-items-center" style={{ color: 'gray' }}>
                            <span style={{ whiteSpace: 'nowrap' }}>1 รอจ่าย</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {renderCard('ใบสั่งซื้อ', 'fas fa-file-invoice', 1, [5, 0, 0], '/purchase-order')}
                {renderCard('ใบรับสินค้า', 'fas fa-box-open', 0, [5, 0, 0], '/product-receipt')}
                {renderCard('ใบสำคัญจ่าย', 'fas fa-file-invoice-dollar', 1, [5, 0, 0], '/payment-voucher')}
                {renderCard('รายการซื้อ', 'far fa-list-alt', 1, [5, 0, 0], '/purchase-list')}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Purchase;
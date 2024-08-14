import React from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

const SellProducts = () => {
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
    <div className="Warehouse">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={"คลัง"} items={[
                  { name: 'คลัง', url: '/warehouse' },
                ]} />
              </div>
              <div className="row">
                {renderCard('ใบเสนอราคา (QT)', 'far fa-file-alt', 1, [5, 0, 0], '/quotation')}
                {renderCard('ใบขาย (SO)', 'fas fa-file-invoice', 1, [5, 0, 0], '/billofsale')}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SellProducts;

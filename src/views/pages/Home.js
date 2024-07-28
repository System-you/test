import React from 'react';

// Components
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

function Home() {
  return (
    <div className="Home">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <div className="page-header d-flex justify-content-between align-items-center">
                <Breadcrumbs page={"Dashboard"} items={[]} />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Home;
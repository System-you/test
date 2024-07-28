import React from 'react';

// CSS
import '../../assets/css/404.css';

// Components
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function NotFoundPage() {
  return (
    <div className="Sales">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <div id="notfound">
                <div className="notfound">
                  <div className="notfound-404">
                    <h1>404</h1>
                  </div>
                  <h2>Oops! Nothing was found</h2>
                  <p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.
                    <a href="/">Return to homepage</a></p>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
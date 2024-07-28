import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from "axios";

// CSS
import '../../assets/css/components/sidebar.css';

// Utils
import { getAlert } from '../../utils/SamuiUtils';

function Sidebar() {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setLoading(false);
      } else {
        getAlert('FAILED', "Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาล็อกอินใหม่อีกครั้ง");

        // เพิ่ม Delay 2 วินาที ก่อนที่จะเปลี่ยนเส้นทาง
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      getAlert('FAILED', error.message);

      // เพิ่ม Delay 2 วินาที ก่อนที่จะเปลี่ยนเส้นทาง
      setTimeout(() => {
        window.location.replace('/login');
      }, 2000);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  var toggle_sidebar = false,
    toggle_topbar = false,
    minimize_sidebar = false,
    first_toggle_sidebar = false,
    toggle_page_sidebar = false,
    toggle_overlay_sidebar = false,
    nav_open = 0,
    quick_sidebar_open = 0,
    topbar_open = 0,
    mini_sidebar = 0,
    page_sidebar_open = 0,
    overlay_sidebar_open = 0;


  if (!toggle_sidebar) {
    var toggle = $('.sidenav-toggler');

    toggle.on('click', function () {
      if (nav_open == 1) {
        $('html').removeClass('nav_open');
        toggle.removeClass('toggled');
        nav_open = 0;
      } else {
        $('html').addClass('nav_open');
        toggle.addClass('toggled');
        nav_open = 1;
      }
    });
    toggle_sidebar = true;
  }

  if (!quick_sidebar_open) {
    var toggle = $('.quick-sidebar-toggler');

    toggle.on('click', function () {
      if (nav_open == 1) {
        $('html').removeClass('quick_sidebar_open');
        $('.quick-sidebar-overlay').remove();
        toggle.removeClass('toggled');
        quick_sidebar_open = 0;
      } else {
        $('html').addClass('quick_sidebar_open');
        toggle.addClass('toggled');
        $('<div className="quick-sidebar-overlay"></div>').insertAfter('.quick-sidebar');
        quick_sidebar_open = 1;
      }
    });

    $('.wrapper').mouseup(function (e) {
      var subject = $('.quick-sidebar');

      if (e.target.className != subject.attr('class') && !subject.has(e.target).length) {
        $('html').removeClass('quick_sidebar_open');
        $('.quick-sidebar-toggler').removeClass('toggled');
        $('.quick-sidebar-overlay').remove();
        quick_sidebar_open = 0;
      }
    });

    $(".close-quick-sidebar").on('click', function () {
      $('html').removeClass('quick_sidebar_open');
      $('.quick-sidebar-toggler').removeClass('toggled');
      $('.quick-sidebar-overlay').remove();
      quick_sidebar_open = 0;
    });

    quick_sidebar_open = true;
  }

  if (!toggle_topbar) {
    var topbar = $('.topbar-toggler');

    topbar.on('click', function () {
      if (topbar_open == 1) {
        $('html').removeClass('topbar_open');
        topbar.removeClass('toggled');
        topbar_open = 0;
      } else {
        $('html').addClass('topbar_open');
        topbar.addClass('toggled');
        topbar_open = 1;
      }
    });
    toggle_topbar = true;
  }

  if (!minimize_sidebar) {
    var minibutton = $('.toggle-sidebar');
    if ($('.wrapper').hasClass('sidebar_minimize')) {
      minibutton.addClass('toggled');
      minibutton.html('<i className="gg-more-vertical-alt"></i>');
      mini_sidebar = 1;
    }

    minibutton.on('click', function () {
      if (mini_sidebar == 1) {
        $('.wrapper').removeClass('sidebar_minimize')
        minibutton.removeClass('toggled');
        minibutton.html('<i className="gg-menu-right"></i>');
        mini_sidebar = 0;
      } else {
        $('.wrapper').addClass('sidebar_minimize');
        minibutton.addClass('toggled');
        minibutton.html('<i className="gg-more-vertical-alt"></i>');
        mini_sidebar = 1;
      }
      $(window).resize();
    });
    minimize_sidebar = true;
    first_toggle_sidebar = true;
  }

  if (!toggle_page_sidebar) {
    var pageSidebarToggler = $('.page-sidebar-toggler');

    pageSidebarToggler.on('click', function () {
      if (page_sidebar_open == 1) {
        $('html').removeClass('pagesidebar_open');
        pageSidebarToggler.removeClass('toggled');
        page_sidebar_open = 0;
      } else {
        $('html').addClass('pagesidebar_open');
        pageSidebarToggler.addClass('toggled');
        page_sidebar_open = 1;
      }
    });

    var pageSidebarClose = $('.page-sidebar .back');

    pageSidebarClose.on('click', function () {
      $('html').removeClass('pagesidebar_open');
      pageSidebarToggler.removeClass('toggled');
      page_sidebar_open = 0;
    });

    toggle_page_sidebar = true;
  }

  if (!toggle_overlay_sidebar) {
    var overlaybutton = $('.sidenav-overlay-toggler');
    if ($('.wrapper').hasClass('is-show')) {
      overlay_sidebar_open = 1;
      overlaybutton.addClass('toggled');
      overlaybutton.html('<i className="icon-options-vertical"></i>');
    }

    overlaybutton.on('click', function () {
      if (overlay_sidebar_open == 1) {
        $('.wrapper').removeClass('is-show');
        overlaybutton.removeClass('toggled');
        overlaybutton.html('<i className="icon-menu"></i>');
        overlay_sidebar_open = 0;
      } else {
        $('.wrapper').addClass('is-show');
        overlaybutton.addClass('toggled');
        overlaybutton.html('<i className="icon-options-vertical"></i>');
        overlay_sidebar_open = 1;
      }
      $(window).resize();
    });
    minimize_sidebar = true;
  }

  $('.sidebar').mouseenter(function () {
    if (mini_sidebar == 1 && !first_toggle_sidebar) {
      $('.wrapper').addClass('sidebar_minimize_hover');
      first_toggle_sidebar = true;
    } else {
      $('.wrapper').removeClass('sidebar_minimize_hover');
    }
  }).mouseleave(function () {
    if (mini_sidebar == 1 && first_toggle_sidebar) {
      $('.wrapper').removeClass('sidebar_minimize_hover');
      first_toggle_sidebar = false;
    }
  });

  $(".nav-item a").on('click', (function () {
    if ($(this).parent().find('.collapse').hasClass("show")) {
      $(this).parent().removeClass('submenu');
    } else {
      $(this).parent().addClass('submenu');
    }
  }));

  return (
    <>
      <div className="sidebar" data-background-color="dark">
        <div className="sidebar-logo">
          <div className="logo-header" data-background-color="dark">
            <a onClick={() => window.location.replace('/')} className="logo">
              <img src="assets/img/logo_light.png" alt="Logo Light" className="navbar-brand" width={110} />
            </a>
            <div className="nav-toggle">
              <button className="btn btn-toggle toggle-sidebar">
                <i className="gg-menu-right"></i>
              </button>
              <button className="btn btn-toggle sidenav-toggler">
                <i className="gg-menu-left"></i>
              </button>
            </div>
            <button className="topbar-toggler more">
              <i className="gg-more-vertical-alt" />
            </button>
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
                  <i className="fas fa-database" style={{ color: 'white' }} />
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
                    <li className={`nav-item ${location.pathname === '/purchase-list' ? 'active' : ''}`}>
                      <a href="/purchase-list">
                        <span className="sub-item">รายการซื้อ</span>
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
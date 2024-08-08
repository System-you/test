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
              <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
                <div className="page-header d-flex justify-content-between align-items-center">
                  <Breadcrumbs page={"Dashboard"} items={[]} />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-primary bubble-shadow-small">
                            <i className="fas fa-users" />
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Visitors</p>
                            <h4 className="card-title">1,294</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-info bubble-shadow-small">
                            <i className="fas fa-user-check" />
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Subscribers</p>
                            <h4 className="card-title">1303</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-success bubble-shadow-small">
                            <i className="fas fa-luggage-cart" />
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Sales</p>
                            <h4 className="card-title">$ 1,345</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-secondary bubble-shadow-small">
                            <i className="far fa-check-circle" />
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Order</p>
                            <h4 className="card-title">576</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
                  <div className="card card-round">
                    <div className="card-header">
                      <div className="card-head-row card-tools-still-right">
                        <div className="card-title">Transaction History</div>
                        <div className="card-tools">
                          <div className="dropdown">
                            <button className="btn btn-icon btn-clean me-0" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              <i className="fas fa-ellipsis-h" />
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <a className="dropdown-item" href="#">Action</a>
                              <a className="dropdown-item" href="#">Another action</a>
                              <a className="dropdown-item" href="#">Something else here</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        {/* Projects table */}
                        <table className="table align-items-center mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th scope="col">Payment Number</th>
                              <th scope="col" className="text-end">Date &amp; Time</th>
                              <th scope="col" className="text-end">Amount</th>
                              <th scope="col" className="text-end">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">
                                <button className="btn btn-icon btn-round btn-success btn-sm me-2">
                                  <i className="fa fa-check" />
                                </button>
                                Payment from #10231
                              </th>
                              <td className="text-end">Mar 19, 2020, 2.45pm</td>
                              <td className="text-end">$250.00</td>
                              <td className="text-end">
                                <span className="badge badge-success">Completed</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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

export default Home;
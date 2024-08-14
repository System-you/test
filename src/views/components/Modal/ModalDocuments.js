
const ModalDocuments = ({ showModalItem, handleCloseModalItem, apiOnHand }) => {

    return <div
        className={`modal ${showModalItem ? 'show' : ''}`}
        style={{ display: showModalItem ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
    >
        <div className="modal-dialog modal-xl mt-5" role="document">
            <div className="modal-content shadow-lg">
                <div className="modal-header">
                    <button type="button" className="btn-close" onClick={handleCloseModalItem}></button>
                </div>
                <div className="modal-body">
                    {/*  */}
                    <div className="container my-3">
                        <div className="row">
                            <div className="col-6">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="ค้นหา" />
                                    <button className="btn btn-outline-secondary" type="button">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="d-flex ">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked />
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            เรียงตามรหัสสินค้า
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                                        <label class="form-check-label" for="flexRadioDefault2">
                                            เรียงตามชื่อสินค้า
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  */}
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table id="basic-datatables" className="table table-striped table-hover">
                                                <thead className="thead-dark">
                                                    <tr>
                                                        <th className="text-center" style={{ width: '1%' }}>Line</th>
                                                        <th className="text-center" style={{ width: '3%' }}>สถานะ</th>
                                                        <th className="text-center" style={{ width: '10%' }}>รหัสสินค้า</th>
                                                        <th className="text-center" style={{ width: '20%' }}>ชื่อสินค้า</th>
                                                        <th className="text-center" style={{ width: '6%' }}>ราคาปก</th>
                                                        <th className="text-center" style={{ width: '6%' }}>ราคาทุน</th>
                                                        <th className="text-center" style={{ width: '6%' }}>จุดสั่งซื้อ</th>
                                                        <th className="text-center" style={{ width: '6%' }}>หน่วย</th>
                                                        <th className="text-center" style={{ width: '10%' }}>กลุ่มสินค้า</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* {
                                                        apiOnHand.length > 0 ? (
                                                            apiOnHand.map((item, index) => (
                                                                <tr>
                                                                    <td className="text-center">
                                                                        <input type="checkbox" />
                                                                    </td>
                                                                    <td className="text-center">Y</td>
                                                                    <td className="text-center">04000100C</td>
                                                                    <td className="">ดรุณศึกษา ป.1</td>
                                                                    <td className="text-center">44.41</td>
                                                                    <td className="text-center">20.00</td>
                                                                    <td className="text-center">13.14</td>
                                                                    <td className="text-center">50</td>
                                                                    <td className="text-center">ทดสอบกลุ่มสินค้า</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={11}>
                                                                    <div className="text-center">
                                                                        <h5>ไม่พบข้อมูล</h5>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )} */}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="d-inline-block me-2">
                                                        <button className="btn text-white" style={{
                                                            backgroundColor: 'green',
                                                            fontSize: '16px'
                                                        }}>
                                                            <i className="fa fa-check me-2" aria-hidden="true"></i> เลือก
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="modal-footer">
                </div> */}
            </div>
        </div>
    </div>
    { showModalItem && <div className="modal-backdrop fade show"></div> }
};

export default ModalDocuments;

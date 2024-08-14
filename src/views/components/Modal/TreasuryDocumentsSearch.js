
const TreasuryDocumentsSearch = ({ showModalSearch, handleCloseSearch }) => {

    return <div
        className={`modal ${showModalSearch ? 'show' : ''}`}
        style={{ display: showModalSearch ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
    >
        <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">ค้นหา...</h5>
                    <button type="button" className="btn-close" onClick={handleCloseSearch}></button>
                </div>
                <div className="modal-body">
                    modal-body
                </div>
                <div className="modal-footer">
                    modal-footer
                </div>
            </div>
        </div>
    </div>
    { showModalSearch && <div className="modal-backdrop fade show"></div> }
};

export default TreasuryDocumentsSearch;

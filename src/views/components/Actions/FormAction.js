import React from 'react';

const FormAction = ({ onSubmit, mode }) => {
    return (
        <div className="row mt-2">
            <div className="col-6" />
            <div className="col-6 text-end">
                <button
                    onClick={onSubmit}
                    type="button"
                    className="btn btn-info w-25"
                    hidden={mode === 'U'}
                >
                    บันทึก
                </button>
                <button
                    onClick={() => window.location.reload()}
                    type="button"
                    className="btn btn-outline-danger w-25"
                    style={{ marginLeft: '20px' }}
                >
                    ยกเลิก
                </button>
            </div>
        </div>
    );
};

export default FormAction;
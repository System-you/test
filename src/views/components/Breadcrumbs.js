import React from 'react';

const Breadcrumbs = ({ page, isShowStatus, statusName, statusColour, items }) => {
    return (
        <div className="page-header" style={{ paddingTop: '2rem' }}>
            <h1 className="fw-bold" style={{ color: '#2A2F5B' }}>{page}</h1>
            <ul className="breadcrumbs">
                <li className="nav-home">
                    <a href="/">
                        <i className="icon-home fw-bold" style={{ color: '#EF6C00' }}></i>
                    </a>
                </li>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <li className="separator fw-bold" style={{ color: '#EF6C00' }}>
                            <i className="icon-arrow-right fw-bold"></i>
                        </li>
                        <li className="nav-item">
                            <a
                                className="fw-bold"
                                style={item.style || { color: '#EF6C00' }}
                                href={item.url}
                            >
                                {item.name}
                            </a>
                        </li>
                    </React.Fragment>
                ))}
            </ul>
            {isShowStatus && (
                <div className="page-header col-2" style={{ marginBottom: '-1px', marginLeft: '30px' }}>
                    <button
                        className="btn btn-lg w-75"
                        style={{
                            backgroundColor: statusColour,
                            fontSize: '18px',
                            color: 'white'
                        }}
                    >
                        {statusName}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Breadcrumbs;
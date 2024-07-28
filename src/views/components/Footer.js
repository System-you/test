import React from 'react';
import Axios from 'axios';

function Footer() {
    const [version, setVersion] = React.useState();

    React.useEffect(() => {
        // Function to fetch data from the API
        const fetchVersion = async () => {
            try {
                const response = await Axios.get(`${process.env.REACT_APP_API_URL}/`);
                setVersion(response.data.message);
            } catch (error) {
                console.error('Error fetching the version:', error);
            }
        };

        fetchVersion();
    }, []);

    return (
        <>
            <footer className="footer">
                <div className="container-fluid d-flex justify-content-between">
                    <nav className="pull-left">
                        {/* <ul className="nav">
                            <li className="nav-item">
                                <a className="nav-link" href="http://www.themekita.com">
                                    ThemeKita
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"> Help </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"> Licenses </a>
                            </li>
                        </ul> */}
                    </nav>
                    <div className="copyright">
                        {/* 2024, made with <i className="fa fa-heart heart text-danger" /> by
                        <a href="http://www.themekita.com">ThemeKita</a> */}
                    </div>
                    <div>
                        Version {version}
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;
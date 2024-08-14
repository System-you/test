import React, { useEffect, useState } from 'react';
import Axios from "axios";

// Utils
import { getCompany, getAlert } from '../../utils/SamuiUtils';

function Login() {
    const [companyList, setCompanyList] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('emp_id');
            localStorage.removeItem('name');
            localStorage.removeItem('company');
            const companyList = await getCompany();
            setCompanyList(companyList);
        } catch (error) {
            getAlert('FAILED', error.message);
        }
    };

    const onChangeButton = (companyId) => {
        setSelectedCompany(companyId);
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            // ดึงค่าจากฟอร์ม
            const username = document.getElementById('login_username').value;
            const password = document.getElementById('login_password').value;

            // ตรวจสอบข้อมูลที่กรอก
            if (!username || !password) {
                getAlert('FAILED', "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
                return;
            }
            if (!selectedCompany) {
                getAlert('FAILED', "กรุณาเลือกบริษัท");
                return;
            }

            // ส่งข้อมูลล็อกอินไปยัง API
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
                username,
                password,
                company: selectedCompany
            }, {
                headers: { key: process.env.REACT_APP_ANALYTICS_KEY }
            });

            const { status, message, token } = response.data;

            getAlert(status, message);

            if (status === 'OK') {
                // ใช้ API Authen ดึงข้อมูลเพิ่มเติม
                const authenResponse = await Axios.post(`${process.env.REACT_APP_API_URL}/api/authen`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        key: process.env.REACT_APP_ANALYTICS_KEY
                    }
                });

                const authenStatus = authenResponse.data.status;
                const authenData = authenResponse.data.decoded;

                if (authenStatus === 'OK') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('emp_id', authenData.Emp_Id);
                    localStorage.setItem('name', authenData.Emp_Name);
                    localStorage.setItem('company', authenData.Comp_Id);

                    // เพิ่ม Delay 1 วินาที ก่อนที่จะเปลี่ยนเส้นทาง
                    setTimeout(() => {
                        window.location.replace("/");
                    }, 1000); // 1000 milliseconds = 1 second
                } else {
                    // ลบข้อมูลจาก localStorage หากการตรวจสอบ Authen ไม่สำเร็จ
                    localStorage.removeItem('token');
                    localStorage.removeItem('emp_id');
                    localStorage.removeItem('name');
                    localStorage.removeItem('company');
                }
            } else {
                // ลบข้อมูลจาก localStorage หากล็อกอินไม่สำเร็จ
                localStorage.removeItem('token');
                localStorage.removeItem('emp_id');
                localStorage.removeItem('name');
                localStorage.removeItem('company');
            }
        } catch (error) {
            console.error('Error during login:', error); // แสดงข้อผิดพลาดใน console
            getAlert("FAILED", error.message);
        }
    };

    return (
        <div className="Login" style={{ height: '100vh' }}>
            <div className="container d-flex align-items-center justify-content-center h-100">
                <div className="col-8 col-md-8 col-lg-4">
                    <div className="card o-hidden border-0 shadow-lg my-5">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <img
                                    src="assets/img/logo_login.png"
                                    alt="Login Image"
                                    className="navbar-brand mb-3"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '16px 0px 0px 0px',
                                        border: '1px solid transparent',
                                    }}
                                />
                                <h3 style={{ color: '#EF6C00' }}>Sign-in to System you</h3>
                            </div>
                            <form className="user" onSubmit={handleLogin}>
                                <div className="form-group text-start">
                                    <label htmlFor="login_username">Username</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fa fa-user" />
                                        </span>
                                        <input
                                            className="form-control form-control-lg"
                                            id="login_username"
                                            type="text"
                                            name="login_username"
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>
                                <div className="form-group text-start">
                                    <label htmlFor="login_password">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fa fa-lock" />
                                        </span>
                                        <input
                                            className="form-control form-control-lg"
                                            id="login_password"
                                            type="password"
                                            name="login_password"
                                            placeholder="Password"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Select Company</label>
                                    <div className="row">
                                        {companyList.map((company) => (
                                            <div className="col-6" key={company.Comp_Id}>
                                                <button
                                                    type="button"
                                                    className="btn text-white"
                                                    onClick={() => onChangeButton(company.Comp_Id)}
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: company.Comp_Id === selectedCompany ? '#1976D2' : '#EF6C00'
                                                    }}>
                                                    {company.Comp_ShortName}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group text-start mb-4">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" />
                                        <label className="form-check-label">
                                            Keep me logged in
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    style={{ backgroundColor: '#EF6C00' }}
                                    className="btn btn-lg w-100 shadow text-white">
                                    Login
                                </button>
                                <div className="text-center mt-4">
                                    <a
                                        style={{ color: '#EF6C00' }}
                                        href="#"
                                        className="text-decoration-underline">
                                        Forgot Password?
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
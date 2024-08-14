import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from "./views/pages/Login";
import Home from "./views/pages/Home";
import Purchase from "./views/pages/Purchase";
import DepositDocument from "./views/pages/Purchase/DepositDoc";
import PurchaseRequest from "./views/pages/Purchase/PurchaseRequest";
import PurchaseOrder from "./views/pages/Purchase/PurchaseOrder";
import ProductReceipt from "./views/pages/Purchase/ProductReceipt";
import PaymentVoucher from "./views/pages/Purchase/PaymentVoucher";
import Warehouse from "./views/pages/Warehouse";
import WarehouseStock from "./views/pages/Warehouse/WarehouseStock";
import TreasuryDocuments from "./views/pages/Warehouse/TreasuryDocuments";
import NotFoundPage from "./views/pages/404";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Purchase */}
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        <Route path="/purchase" element={isLoggedIn ? <Purchase /> : <Navigate to="/login" />} />
        <Route path="/deposit-document" element={isLoggedIn ? <DepositDocument /> : <Navigate to="/login" />} />
        <Route path="/purchase-request" element={isLoggedIn ? <PurchaseRequest /> : <Navigate to="/login" />} />
        <Route path="/purchase-order" element={isLoggedIn ? <PurchaseOrder /> : <Navigate to="/login" />} />
        <Route path="/product-receipt" element={isLoggedIn ? <ProductReceipt /> : <Navigate to="/login" />} />
        <Route path="/payment-voucher" element={isLoggedIn ? <PaymentVoucher /> : <Navigate to="/login" />} />

        {/* Warehouse */}
        <Route path="/warehouse" element={isLoggedIn ? <Warehouse /> : <Navigate to="/login" />} />
        <Route path="/warehouse-stock" element={isLoggedIn ? <WarehouseStock /> : <Navigate to="/login" />} />
        <Route path="/treasury-documents" element={isLoggedIn ? <TreasuryDocuments /> : <Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

root.render(<App />);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from "./views/pages/Login";
import Home from "./views/pages/Home";
import Purchase from "./views/pages/Purchase";
import PurchaseRequest from "./views/pages/Purchase/PurchaseRequest";
import PurchaseOrder from "./views/pages/Purchase/PurchaseOrder";
import ProductReceipt from "./views/pages/Purchase/ProductReceipt";
import PaymentVoucher from "./views/pages/Purchase/PaymentVoucher";
import NotFoundPage from "./views/pages/404";

const root = ReactDOM.createRoot(document.getElementById("root"));
const isLoggedIn = localStorage.getItem('token');

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
      <Route path="/purchase" element={isLoggedIn ? <Purchase /> : <Navigate to="/login" />} />
      <Route path="/purchase-request" element={isLoggedIn ? <PurchaseRequest /> : <Navigate to="/login" />} />
      <Route path="/purchase-order" element={isLoggedIn ? <PurchaseOrder /> : <Navigate to="/login" />} />
      <Route path="/product-receipt" element={isLoggedIn ? <ProductReceipt /> : <Navigate to="/login" />} />
      <Route path="/payment-voucher" element={isLoggedIn ? <PaymentVoucher /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

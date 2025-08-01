import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginForm from "./components/login/LoginForm";
import Register from "./pages/Register";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/app/*" element={<App />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

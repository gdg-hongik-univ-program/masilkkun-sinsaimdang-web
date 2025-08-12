import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import LoginForm from "../login/LoginForm";
import Register from "../../pages/Register";

const LoginRegisterModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  useEffect(() => {
    if (isOpen) {
      setMode("login");
    }
  }, [isOpen]);
  console.log("Current mode:", mode);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={mode === "register" ? "modal-register" : "modeal-default"}
    >
      {mode === "login" ? (
        <LoginForm onSwitch={() => setMode("register")} />
      ) : (
        <Register onSwitch={() => setMode("login")} />
      )}
    </Modal>
  );
};

export default LoginRegisterModal;

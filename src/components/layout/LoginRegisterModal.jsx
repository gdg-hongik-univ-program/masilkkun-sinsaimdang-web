import { useState, useEffect } from "react";
import Modal from "./Modal";
import LoginForm from "../login/LoginForm";
import Register from "../../pages/Register";


const LoginRegisterModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState("login");
  useEffect(() => {
    if (!isOpen) {
      setMode("login");
    }
  }, [isOpen]);

  const onRegisterSuccess = () => {
    setMode("login");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={mode === "register" ? "modal-register" : "modal-default"}
    >
      {mode === "login" ? (
        <LoginForm
          onSwitch={() => setMode("register")}
          onLoginSuccess={onLoginSuccess}
        />
      ) : (
        <Register
          onSwitch={() => setMode("login")}
          onRegisterSuccess={onRegisterSuccess}
        />
      )}
    </Modal>
  );
};

export default LoginRegisterModal;

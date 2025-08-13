import logo from "../../assets/Logo.png";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import baseApi from "../../api/baseApi";

const LoginForm = ({ onSwitch }) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const nav = useNavigate();

  const onChangeCheckbox = (e) => {
    setIsChecked(e.target.checked);
  };

  const onIdChange = (e) => {
    setId(e.target.value);
    setErrorMessage("");
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await baseApi.post("/auth/login", {
        email: id,
        password,
      });

      const { accessToken } = response.data.data;

      if (isChecked) {
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
      }

      nav("/app/postlist");
    } catch (error) {
      console.error("로그인 실패:", error);
      setErrorMessage(
        "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요."
      );
    }
  };

  return (
    <div className="loginform">
      <img src={logo} className="logo" />
      <form onSubmit={handleLogin}>
        <div className="formbox">
          <div className="formtitle">로그인/회원가입</div>
          <div className="formbody">
            <div className="inputs">
              <input
                className="input"
                type="text"
                value={id}
                onChange={onIdChange}
                placeholder="아이디"
              />
              <input
                className="input"
                type="password"
                value={password}
                onChange={onPasswordChange}
                placeholder="비밀번호"
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="login-button">
              로그인
            </button>
          </div>
          <div className="login-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                onChange={onChangeCheckbox}
                checked={isChecked}
              />
              로그인 유지
            </label>
            <label
              type="button"
              className="plane-link"
              onClick={() => alert("아이디/비밀번호 찾기는 추후 구현")}
            >
              아이디/비밀번호 찾기
            </label>
            <span
              className="plain-button"
              role="button"
              tabIndex={0}
              onClick={onSwitch}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSwitch();
              }}
            >
              회원가입
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

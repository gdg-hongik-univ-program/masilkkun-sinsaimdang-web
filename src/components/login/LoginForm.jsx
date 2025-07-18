import logo from "../../assets/img/Logo.png";
import "./LoginForm.css";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const user = {
  id: "jswun123",
  password: "jsyun0219",
}; // mock data

const LoginForm = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const option = {
      url: "주소",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      },
      data: {
        id: id,
        password: password,
      },
    };
    try {
      const reponse = await axios(option);
      console.log(Response.data);
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };
  const onChangeCheckbox = (e) => {
    setIsChecked(e.target.checked);
  };
  const onIdChange = (e) => {
    setId(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
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
            <button className="button">로그인</button>
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
            <span>아이디/비밀번호 찾기</span>
            <span>회원가입</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

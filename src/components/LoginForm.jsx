import React from "react";
import logo from "../assets/Logo.png";
import "./LoginForm.css";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import baseApi from "../api/baseApi";

const user = {
  id: "soojin",
  password: "12345678",
}; // mock data

const LoginForm = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const nav = useNavigate();

  const onChangeCheckbox = (e) => {
    setIsChecked(e.target.checked);
  };

  const onIdChange = (e) => {
    setId(e.target.value);
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("로그인 작동중"); // 버튼 작동 확인 여기!!!!!

    // mock 데이터와 비교(api연결할때 지워야할 부분 )
    if (id === user.id && password === user.password) {
      console.log("로그인 성공 (Mock)");

      const token = "mock-token-123";

      if (isChecked) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      nav("/app/postlist"); //라우터에 등록된 경로로 이동
    } else {
      console.error("로그인 실패 (Mock)");
      alert("로그인에 실패했습니다.");
    }
  };

  //   try {
  //     const response = await baseApi.post("/api/auth/login", {
  //       email: id,
  //       password,
  //     }); // 요청 보냄
  //     console.log("로그인 성공", response.data);

  //     if (isChecked) {
  //       localStorage.setItem("token", response.data.token);
  //       // 로그인 유지 체크 : 창 닫아도 로그인 유지 여기!!!!!
  //     } else {
  //       sessionStorage.setItem("token", response.data.token);
  //       // 로그인 유지 체크 X : 창 닫으면 로그아웃
  //     }
  //     nav("/home");
  //   } catch (error) {
  //     console.error("로그인 실패:", error);
  //     alert("로그인에 실패했습니다.");
  //   }
  // };

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
            <Link to="/Find-id" className="plane-link">
              아이디/비밀번호 찾기
            </Link>
            <Link to="/Register" className="plane-link">
              회원가입
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

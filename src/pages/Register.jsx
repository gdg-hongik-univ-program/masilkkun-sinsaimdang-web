import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import baseApi from "../api/baseApi";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (password.length < 4 || password.length > 16) {
      alert("비밀번호는 4자 이상 16자 이하로 입력해주세요.");
      return;
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{4,16}$/;
    if (!pwRegex.test(password)) {
      alert("비밀번호는 영어/숫자/특수문자를 포함해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (name.trim().length === 0) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (nickname.length < 2 || nickname.length > 12) {
      alert("닉네임은 2자 이상 12자 이하로 입력해주세요.");
      return;
    }

    // API 요청 다시 확인 차 해봐야하는곳
    try {
      const response = await baseApi.post("/auth/signup", {
        email,
        password,
        name,
        nickname,
      });

      if (response.status === 201 || response.status === 200) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">회원가입</h2>
      <form onSubmit={handleSubmit} className="register-form">
        {/* 이메일 */}
        <div className="form-group">
          <label className="register-label">이메일</label>
          <div className="input-with-button">
            <input
              type="email"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
            />
            <button type="button" className="dup-check-button">
              중복 확인
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="form-group">
          <label className="register-label">비밀번호</label>
          <input
            type="password"
            placeholder="4자 이상 16자 이하의 영어 대소문자, 숫자, 특수문자 조합"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div className="form-group">
          <label className="register-label">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력해주세요."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="register-input"
          />
        </div>

        {/* 이름 */}
        <div className="form-group">
          <label className="register-label">이름</label>
          <input
            type="text"
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="register-input"
          />
        </div>

        {/* 닉네임 */}
        <div className="form-group">
          <label className="register-label">닉네임</label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="2자 이상 12자 이하"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="register-input"
            />
            <button type="button" className="dup-check-button">
              중복 확인
            </button>
          </div>
        </div>

        {/* 제출 */}
        <button type="submit" className="register-button">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;

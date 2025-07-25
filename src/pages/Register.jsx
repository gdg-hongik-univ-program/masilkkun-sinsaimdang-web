import React, { useState } from "react";
import baseApi from "../api/baseApi"; // 백엔드 API 요청
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    nickname: "",
  });

  const nav = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await baseApi.post("/api/auth/signup", {
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
      });

      console.log("회원가입 성공", response.data);
      alert("회원가입이 완료되었습니다.");
      nav("/login");
    } catch (err) {
      console.error("회원가입 실패", err.response?.data || err);
      alert("회원가입 실패: " + (err.response?.data?.message || "오류 발생"));
    }
  };

  return (
    <div className="register">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={onChange}
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={onChange}
        />
        <input
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호 확인"
          value={form.passwordConfirm}
          onChange={onChange}
        />
        <input
          name="name"
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={onChange}
        />
        <input
          name="nickname"
          type="text"
          placeholder="닉네임"
          value={form.nickname}
          onChange={onChange}
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import baseApi from "../api/baseApi";

const Register = ({ onSwitch }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  // 중복 확인 여부 상태
  const [emailChecked, setEmailChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  // 이메일 중복 확인
  const checkEmailDuplication = async () => {
    if (!email.includes("@")) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-email", {
        params: { email },
      });
      const isAvailable = res.data.data.available;

      if (isAvailable) {
        alert("사용 가능한 이메일입니다.");
        setEmailChecked(true);
      } else {
        alert("이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      alert("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 중복 확인
  const checkNicknameDuplication = async () => {
    if (nickname.length < 2 || nickname.length > 12) {
      alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-nickname", {
        params: { nickname },
      });

      const isAvailable = res.data.data.available;

      if (isAvailable) {
        alert("사용 가능한 닉네임입니다.");
        setNicknameChecked(true);
      } else {
        alert("이미 사용 중인 닉네임입니다.");
        setNicknameChecked(false);
      }
    } catch (error) {
      console.error("닉네임 중복 확인 오류:", error);
      alert("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (!emailChecked) {
      alert("이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    if (password.length < 4 || password.length > 16) {
      alert(
        "비밀번호는 8~20자 이하, 대소문자, 숫자, 특수문자 포함해서 입력해주세요."
      );
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
      alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      return;
    }

    if (!nicknameChecked) {
      alert("닉네임 중복 확인을 먼저 해주세요.");
      return;
    }

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
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailChecked(false); // 수정 시 다시 확인 필요
              }}
              className="register-input"
            />
            <button
              type="button"
              className="dup-check-button"
              onClick={checkEmailDuplication}
            >
              중복 확인
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="form-group">
          <label className="register-label">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호는 8~20자 이하, 대소문자, 숫자, 특수문자 포함"
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
              placeholder="2자 이상 10자 이하"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameChecked(false); // 수정 시 다시 확인 필요
              }}
              className="register-input"
            />
            <button
              type="button"
              className="dup-check-button"
              onClick={checkNicknameDuplication}
            >
              중복 확인
            </button>
          </div>
        </div>

        {/* 제출 */}
        <button type="submit" className="register-button">
          회원가입
        </button>
        <span role="button" className="back-to-login" onClick={onSwitch}>
          로그인으로 돌아가기
        </span>
      </form>
    </div>
  );
};

export default Register;

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

  const [emailChecked, setEmailChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const checkEmailDuplication = async () => {
    if (!email.includes("@")) {
      setErrorMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-email", {
        params: { email },
      });
      const isAvailable = res.data.data.available;

      if (isAvailable) {
        setErrorMessage("사용 가능한 이메일입니다.");
        setEmailChecked(true);
      } else {
        setErrorMessage("이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setErrorMessage("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const checkNicknameDuplication = async () => {
    if (nickname.length < 2 || nickname.length > 12) {
      setErrorMessage("닉네임은 2자 이상 12자 이하로 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-nickname", {
        params: { nickname },
      });

      const isAvailable = res.data.data.available;

      if (isAvailable) {
        setErrorMessage("사용 가능한 닉네임입니다.");
        setNicknameChecked(true);
      } else {
        setErrorMessage("이미 사용 중인 닉네임입니다.");
        setNicknameChecked(false);
      }
    } catch (error) {
      console.error("닉네임 중복 확인 오류:", error);
      setErrorMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setErrorMessage("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (!emailChecked) {
      setErrorMessage("이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    if (password.length < 4 || password.length > 16) {
      setErrorMessage(
        "비밀번호는 8~20자 이하, 대소문자, 숫자, 특수문자 포함해서 입력해주세요."
      );
      return;
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{4,16}$/;
    if (!pwRegex.test(password)) {
      setErrorMessage("비밀번호는 영어/숫자/특수문자를 포함해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (name.trim().length === 0) {
      setErrorMessage("이름을 입력해주세요.");
      return;
    }

    if (nickname.length < 2 || nickname.length > 12) {
      setErrorMessage("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      return;
    }

    if (!nicknameChecked) {
      setErrorMessage("닉네임 중복 확인을 먼저 해주세요.");
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
        setErrorMessage("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">회원가입</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="register-label">이메일</label>
          <div className="input-with-button">
            <input
              type="email"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailChecked(false);
                setErrorMessage("");
                s;
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

        <div className="form-group">
          <label className="register-label">비밀번호</label>
          <input
            type="password"
            placeholder="8자 이상 20자 이하의 영어 대소문자, 숫자, 특수문자 조합"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            className="register-input"
          />
        </div>

        <div className="form-group">
          <label className="register-label">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력해주세요."
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
            }}
            className="register-input"
          />
        </div>

        <div className="form-group">
          <label className="register-label">이름</label>
          <input
            type="text"
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrorMessage("");
            }}
            className="register-input"
          />
        </div>

        <div className="form-group">
          <label className="register-label">닉네임</label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="2자 이상 10자 이하"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameChecked(false);
                setErrorMessage("");
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="register-button">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;

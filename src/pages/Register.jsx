import { useState } from "react";
import { useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";
import "./Register.css";

const Register = ({ onSwitch, onRegisterSuccess }) => {
  const navigate = useNavigate();

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  // 중복확인 여부
  const [emailChecked, setEmailChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  // 메시지 상태 분리
  const [emailMessage, setEmailMessage] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [formError, setFormError] = useState("");

  const checkEmailDuplication = async () => {
    setEmailMessage("");
    setFormError("");

    if (!email.includes("@")) {
      setEmailMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-email", {
        params: { email },
      });

      const isAvailable = res.data.data.available;

      if (isAvailable) {
        setEmailMessage("사용 가능한 이메일입니다.");
        setEmailChecked(true);
      } else {
        setEmailMessage("이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setEmailMessage("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const checkNicknameDuplication = async () => {
    setNicknameMessage("");
    setFormError("");

    if (nickname.length < 2 || nickname.length > 12) {
      setNicknameMessage("닉네임은 2자 이상 12자 이하로 입력해주세요.");
      return;
    }

    try {
      const res = await baseApi.get("/auth/check-nickname", {
        params: { nickname },
      });

      const isAvailable = res.data.data.available;

      if (isAvailable) {
        setNicknameMessage("사용 가능한 닉네임입니다.");
        setNicknameChecked(true);
      } else {
        setNicknameMessage("이미 사용 중인 닉네임입니다.");
        setNicknameChecked(false);
      }
    } catch (error) {
      console.error("닉네임 중복 확인 오류:", error);
      setNicknameMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email.includes("@")) {
      setFormError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (!emailChecked) {
      setFormError("이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    if (password.length < 4 || password.length > 16) {
      setFormError(
        "비밀번호는 8~20자 이하, 대소문자, 숫자, 특수문자 포함해서 입력해주세요."
      );
      return;
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{4,16}$/;
    if (!pwRegex.test(password)) {
      setFormError("비밀번호는 영어/숫자/특수문자를 포함해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (name.trim().length === 0) {
      setFormError("이름을 입력해주세요.");
      return;
    }

    if (nickname.length < 2 || nickname.length > 12) {
      setFormError("닉네임은 2자 이상 12자 이하로 입력해주세요.");
      return;
    }

    if (!nicknameChecked) {
      setFormError("닉네임 중복 확인을 먼저 해주세요.");
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
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        onRegisterSuccess();
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      console.log(error.response.data); // 에러 이유 출력
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError("회원가입에 실패했습니다. 다시 시도해주세요.");
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailChecked(false);
                setEmailMessage("");
                setFormError("");
              }}
              className="register-input"
              placeholder="이메일을 입력해주세요."
            />
            <button
              type="button"
              onClick={checkEmailDuplication}
              className="dup-check-button"
            >
              중복 확인
            </button>
          </div>
          {/* 항상 메시지 영역 렌더링 */}
          <p
            className={`message ${
              emailMessage.includes("가능") ? "valid" : "invalid"
            }`}
          >
            {emailMessage}
          </p>
        </div>

        {/* 비밀번호 */}
        <div className="form-group">
          <label className="register-label">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호는 8~20자 이하, 대소문자, 숫자, 특수문자 포함"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError("");
            }}
            className="register-input"
          />
          {/* 비밀번호는 메시지 영역이 없으므로 고정 높이를 위한 빈 div */}
          <div className="message"></div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="form-group">
          <label className="register-label">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFormError("");
            }}
            className="register-input"
            placeholder="비밀번호를 다시 입력해주세요."
          />
          {/* 비밀번호 확인도 메시지 영역이 없으므로 고정 높이를 위한 빈 div */}
          <div className="message"></div>
        </div>

        {/* 이름 */}
        <div className="form-group">
          <label className="register-label">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError("");
            }}
            className="register-input"
            placeholder="이름을 입력해주세요."
          />
          {/* 이름도 메시지 영역이 없으므로 고정 높이를 위한 빈 div */}
          <div className="message"></div>
        </div>

        {/* 닉네임 */}
        <div className="form-group">
          <label className="register-label">닉네임</label>
          <div className="input-with-button">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameChecked(false);
                setNicknameMessage("");
                setFormError("");
              }}
              className="register-input"
              placeholder="2자 이상 12자 이하"
            />
            <button
              type="button"
              onClick={checkNicknameDuplication}
              className="dup-check-button"
            >
              중복 확인
            </button>
          </div>
          {/* 항상 메시지 영역 렌더링 */}
          <p
            className={`message ${
              nicknameMessage.includes("가능") ? "valid" : "invalid"
            }`}
          >
            {nicknameMessage}
          </p>
        </div>

        {/* 공통 에러 메시지 - 항상 렌더링 */}
        <p className="error-message">{formError}</p>

        {/* 회원가입 버튼 */}
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

import logo from "../../assets/Logo.png";
import "./LoginForm.css";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

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
  //여기까지 지워야함

  //  try {
  //       const response = await baseApi.post("/api/auth/login", {
  //         id, // 또는 email: id, ← 백엔드 명세 확인
  //         password,
  //       });

  //       const { accessToken, refreshToken } = response.data;
  //       console.log("로그인 성공", response.data);

  //       if (isChecked) {
  //         // 로그인 유지
  //         localStorage.setItem("accessToken", accessToken);
  //         localStorage.setItem("refreshToken", refreshToken);
  //       } else {
  //         // 브라우저 닫으면 사라짐
  //         sessionStorage.setItem("accessToken", accessToken);
  //         sessionStorage.setItem("refreshToken", refreshToken);
  //       }

  //       nav("/app/postlist"); // 성공 시 이동

  //     } catch (error) {
  //       console.error("로그인 실패:", error);
  //       alert("로그인에 실패했습니다.");
  //     }
  //   };

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

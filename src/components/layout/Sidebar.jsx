import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPen,
  FaCheckCircle,
  FaBookmark,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";
import baseApi from "../../api/baseApi";

const Sidebar = ({ isLoggedIn, setIsLoggedIn, setIsLoginModalOpen }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      return;
    }

    axios
      .get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("유저 정보 요청 실패:", err);
        setUser(null);
      });
  }, []);
  const handleLogout = async () => {
    try {
      await baseApi.post(
        "/auth/logout",
        { email: user.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/");
    }
  };

  const menuItems = [
    { path: "/create", label: "작성", icon: <FaPen /> },
    { path: "/certification", label: "인증", icon: <FaCheckCircle /> },
    { path: "/scrapbook", label: "스크랩북", icon: <FaBookmark /> },
    { path: "/mypage", label: "MY", icon: <FaUser /> },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (isLoggedIn && token) {
        // 로그인 상태일 때만 유저 정보를 가져옴
        try {
          const res = await axios.get("/user/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(res.data);
        } catch (err) {
          console.error("유저 정보 요청 실패:", err);
          setIsLoggedIn(false); // 토큰이 유효하지 않으면 로그아웃 처리
          localStorage.removeItem("accessToken");
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [isLoggedIn]); // 👈 isLoggedIn 상태가 변할 때마다 useEffect 실행!

  const handleMenuClick = (path) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);

      return;
    }
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div
          className="logo-box"
          onClick={() => navigate("/app/postlist")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo2.png" alt="logo2" className="logo-img" />
        </div>
        <div className="profile-box">
          <img
            src={user?.profileImage}
            alt="프로필"
            className="sidebar-profile-img"
          />
          <p className="username">{user?.name}님</p>
        </div>

        <ul className="menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-bottom">
        {isLoggedIn ? ( // 👈 isLoggedIn 상태에 따라 UI를 조건부 렌더링
          <div className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>로그아웃</span>
          </div>
        ) : (
          <div className="logout-btn" onClick={() => setIsLoginModalOpen(true)}>
            <FaUser className="logout-icon" />
            <span>로그인</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

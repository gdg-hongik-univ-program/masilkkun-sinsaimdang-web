import React, { useEffect, useState } from "react";
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
import Modal from "./Modal";
import LoginForm from "../login/LoginForm";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 요청 실패:", err));
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
    { path: "/app/create", label: "작성", icon: <FaPen /> },
    { path: "/app/certification", label: "인증", icon: <FaCheckCircle /> },
    { path: "/app/scrapbook", label: "스크랩북", icon: <FaBookmark /> },
    { path: "/app/mypage", label: "MY", icon: <FaUser /> },
  ];

  const handleMenuClick = (path) => {
    console.log("메뉴 클릭:", path);
    if (!user && path === "/app/mypage") {
      console.log("로그인 안됨, 모달 열림");
      setIsLoginModalOpen(true);
      return;
    }
    navigate(path);
  };

  return (
    <div className="sidebar">
      {/* 상단: 로고, 프로필, 메뉴 */}
      <div className="sidebar-top">
        {/* 로고 */}
        <div
          className="logo-box"
          onClick={() => navigate("/app/postlist")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo2.png" alt="logo2" className="logo-img" />
        </div>

        {/* 프로필 박스 */}
        <div className="profile-box">
          <img
            src={user?.profileImage}
            alt="프로필"
            className="sidebar-profile-img"
          />
          <p className="username">{user?.name}님</p>
        </div>

        {/* 메뉴 */}
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

      {/* 하단: 로그아웃 */}
      <div className="sidebar-bottom">
        <div className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>로그아웃</span>
        </div>
      </div>
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      >
        <LoginForm
          onSuccess={() => {
            setIsLoginModalOpen(false);
            window.location.reload(); // 또는 setUser 재요청
          }}
        />
      </Modal>
    </div>
  );
};
export default Sidebar;

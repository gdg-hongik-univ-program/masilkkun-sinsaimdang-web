import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPen, FaCheckCircle, FaBookmark, FaUser } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/api/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 요청 실패:", err));
  }, []);

  const menuItems = [
    { path: "/app/create", label: "작성", icon: <FaPen /> },
    { path: "/app/certification", label: "인증", icon: <FaCheckCircle /> },
    { path: "/app/scrapbook", label: "스크랩북", icon: <FaBookmark /> },
    { path: "/app/mypage", label: "MY", icon: <FaUser /> },
  ];

  return (
    <div className="sidebar">
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
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

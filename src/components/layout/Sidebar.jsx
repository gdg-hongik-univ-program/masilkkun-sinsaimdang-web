import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaCheckCircle, FaBookmark, FaUser } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ setActivePage }) => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("create");

  useEffect(() => {
    axios
      .get("/api/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 요청 실패:", err));
  }, []);

  const menuItems = [
    { key: "create", label: "작성", icon: <FaPen /> },
    { key: "certification", label: "인증", icon: <FaCheckCircle /> },
    { key: "scrapbook", label: "스크랩북", icon: <FaBookmark /> },
    { key: "mypage", label: "MY", icon: <FaUser /> },
  ];

  return (
    <div className="sidebar">
      {/* 로고 */}
      <div
        className="logo-box"
        onClick={() => {
          setActive("postlist"); // 로컬 메뉴 active 상태도 함께 변경
          setActivePage("postlist"); // 상위 App에 전달
        }}
        style={{ cursor: "pointer" }} // 마우스 커서 변경
      >
        <img src="/logo2.png" alt="logo2" className="logo-img" />
      </div>

      {/* 프로필 박스 */}
      <div className="profile-box">
        <img src={user?.profileImage} alt="사진" className="profile-img" />
        <p className="username">{user?.name}님</p>
      </div>

      {/* 메뉴 */}
      <ul className="menu">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`menu-item ${active === item.key ? "active" : ""}`}
            onClick={() => {
              setActive(item.key);
              setActivePage(item.key);
            }}
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

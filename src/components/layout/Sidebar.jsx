import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaCheckCircle, FaBookmark, FaUser } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ setActivePage }) => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("작성");

  useEffect(() => {
    axios
      .get("/api/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 요청 실패:", err));
  }, []);

  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="logo-box">
        <img src="/logo2.png" alt="logo2" className="logo-img" />
      </div>

      {/* 프로필 박스 */}
      <div className="profile-box">
        <img src={user?.profileImage} alt="사진" className="profile-img" />
        <p className="username">{user?.name}님</p>
      </div>

      {/* 메뉴 */}
      <ul className="menu">
        {[
          { label: "작성", icon: <FaPen /> },
          { label: "인증", icon: <FaCheckCircle /> },
          { label: "스크랩북", icon: <FaBookmark /> },
          { label: "MY", icon: <FaUser /> },
        ].map((item) => (
          <li
            key={item.label}
            className={`menu-item ${active === item.label ? "active" : ""}`}
            onClick={() => {
              setActive(item.label); // 로컬 표시
              setActivePage(item.label); // 부모에 알림
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

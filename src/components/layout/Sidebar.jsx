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

  const menuItems = [
    {
      path: "/create",
      label: "작성",
      icon: <FaPen />,
      tooltip: "게시글 작성",
    },
    {
      path: "/certification",
      label: "인증",
      icon: <FaCheckCircle />,
      tooltip: "인증하기",
    },
    {
      path: "/scrapbook",
      label: "스크랩북",
      icon: <FaBookmark />,
      tooltip: "스크랩북",
    },
    {
      path: "/mypage",
      label: "MY",
      icon: <FaUser />,
      tooltip: "마이페이지",
    },
  ];

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!isLoggedIn || !token) {
        setUser(null);
        return;
      }

      try {
        const res = await baseApi.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.data || res.data); // API 응답 구조에 따라 조정
      } catch (err) {
        console.error("유저 정보 요청 실패:", err);
        console.error("에러 상세:", err.response?.data); // 에러 상세 정보

        // 401이나 403 에러인 경우 로그아웃 처리
        if (err.response?.status === 401 || err.response?.status === 403) {
          setIsLoggedIn(false);
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          setUser(null);
        }
        // 500 에러인 경우 사용자 정보만 null로 설정하고 로그인 상태는 유지
        else {
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [isLoggedIn, setIsLoggedIn]);

  const handleLogout = async () => {
    try {
      if (user?.email) {
        await baseApi.post(
          "/auth/logout",
          { email: user.email },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
      }
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    }
  };

  const handleMenuClick = (path) => {
    console.log("메뉴 클릭:", path, "로그인 상태:", isLoggedIn);

    if (!isLoggedIn) {
      console.log("로그인 모달 열기");
      setIsLoginModalOpen(true);
      return;
    }

    console.log("페이지 이동:", path);
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div
          className="logo-box"
          onClick={() => navigate("/postlist")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo2.png" alt="logo2" className="logo-img" />
        </div>

        {isLoggedIn && user ? (
          <div className="profile-box">
            <img
              src={
                user?.profileImage ||
                user?.profile_image ||
                "/default-profile.png"
              }
              alt="프로필"
              className="sidebar-profile-img"
              onError={(e) => {
                e.target.src = "/default-profile.png";
              }}
            />
            <p className="username">
              {user?.name || user?.nickname || "사용자"}님
            </p>
          </div>
        ) : (
          <div className="profile-box">
            <img
              src="/default-profile.png"
              alt="기본 프로필"
              className="sidebar-profile-img"
            />
            <p className="username">로그인이 필요합니다</p>
          </div>
        )}

        <ul className="menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item.path)}
              data-tooltip={item.tooltip}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        {isLoggedIn ? (
          <div
            className="logout-btn"
            onClick={handleLogout}
            data-tooltip="로그아웃"
          >
            <FaSignOutAlt className="logout-icon" />
            <span>로그아웃</span>
          </div>
        ) : (
          <div
            className="logout-btn"
            onClick={() => setIsLoginModalOpen(true)}
            data-tooltip="로그인"
          >
            <FaUser className="logout-icon" />
            <span>로그인</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

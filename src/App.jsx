import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; // 👈 useNavigate 추가

import Sidebar from "./components/layout/Sidebar";
import PostListPage from "./pages/PostListPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostCoursePage from "./pages/PostCoursePage";
import CertificationPage from "./pages/CertificationPage";
import ScrapbookPage from "./pages/ScrapbookPage";
import MyPage from "./pages/MyPage";
import Mapview from "./components/main/Mapview";
import LoginRegisterModal from "./components/layout/LoginRegisterModal";
import "./components/layout/Layout.css";
import "./App.css";

const App = () => {
  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigate = useNavigate(); // 👈 useNavigate 선언

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    navigate("/postlist"); // 👈 페이지 이동 로직 추가
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    navigate("/postlist");
  };

  return (
    <div className="layout-container">
      <div className="left-section">
        <div className="sidebar-wrapper">
          <Sidebar
            isLoggedIn={isLoggedIn}
            setIsLoginModalOpen={setIsLoginModalOpen}
            setIsLoggedIn={setIsLoggedIn}
            onLogout={handleLogout} // 👈 로그아웃 핸들러를 전달합니다.
          />
        </div>
        <div className="content-wrapper">
          <Routes>
            <Route
              path="postlist"
              element={
                <PostListPage
                  region={region}
                  setRegion={setRegion}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />
              }
            />
            <Route path="create" element={<PostCreatePage />} />
            <Route path="post/:id" element={<PostCoursePage />} />
            <Route path="certification" element={<CertificationPage />} />
            <Route path="scrapbook" element={<ScrapbookPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="*" element={<Navigate to="postlist" />} />
          </Routes>
        </div>
      </div>
      <div className="right-section">
        <Mapview />
      </div>
      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;

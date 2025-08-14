import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

const App = () => {
  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // 앱이 로드될 때 로컬 스토리지에서 로그인 상태 확인
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token); // 토큰이 있으면 true, 없으면 false
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false); // 모달 닫기
  };
  return (
    <div className="layout-container">
      <div className="left-section">
        <div className="sidebar-wrapper">
          <Sidebar
            isLoggedIn={isLoggedIn}
            setIsLoginModalOpen={setIsLoginModalOpen}
            setIsLoggedIn={setIsLoggedIn}
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

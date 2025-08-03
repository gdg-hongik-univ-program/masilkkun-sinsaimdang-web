import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import PostListPage from "./pages/PostListPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostCoursePage from "./pages/PostCoursePage";
import CertificationPage from "./pages/CertificationPage";
import ScrapbookPage from "./pages/ScrapbookPage";
import MyPage from "./pages/MyPage";
import Mapview from "./components/main/Mapview";
import LoginForm from "./components/login/LoginForm";
import Modal from "./components/layout/Modal";
import "./components/layout/Layout.css";

const App = () => {
  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="layout-container">
      <div className="left-section">
        <div className="sidebar-wrapper">
          <Sidebar />
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
    </div>
  );
};

export default App;

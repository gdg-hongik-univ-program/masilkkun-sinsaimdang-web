import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import PostListPage from "./pages/PostListPage";
import PostCreatePage from "./pages/PostCreatePage";
import CertificationPage from "./pages/CertificationPage";
import ScrapbookPage from "./pages/ScrapbookPage";
import MyPage from "./pages/MyPage";
import "./components/layout/Layout.css";

const App = () => {
  return (
    <div className="layout-container">
      <div className="left-section">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="content-wrapper">
          <Routes>
            <Route path="postlist" element={<PostListPage />} />
            <Route path="create" element={<PostCreatePage />} />
            <Route path="certification" element={<CertificationPage />} />
            <Route path="scrapbook" element={<ScrapbookPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="*" element={<Navigate to="postlist" />} />
          </Routes>
        </div>
      </div>
      <div className="right-section">{/* 지도 자리*/}</div>
    </div>
  );
};

export default App;

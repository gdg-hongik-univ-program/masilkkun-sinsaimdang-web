import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import PostListPage from "./pages/PostListPage";
import PostCreatePage from "./pages/PostCreatePage";
import CertificationPage from "./pages/CertificationPage";
import ScrapbookPage from "./pages/ScrapbookPage";
import MyPage from "./pages/MyPage";
import "./components/layout/Layout.css";

const App = () => {
  const [activePage, setActivePage] = useState("postlist");

  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");

  const renderContent = () => {
    switch (activePage) {
      case "create":
        return <PostCreatePage />;
      case "certification":
        return <CertificationPage />;
      case "scrapbook":
        return <ScrapbookPage />;
      case "mypage":
        return <MyPage />;
      case "postlist":
      default:
        return (
          <PostListPage
            region={region}
            setRegion={setRegion}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        );
    }
  };

  return (
    <div className="layout-container">
      <div className="left-section">
        <div className="sidebar-wrapper">
          <Sidebar setActivePage={setActivePage} activePage={activePage} />
        </div>
        <div className="content-wrapper">{renderContent()}</div>
      </div>
      <div className="right-section">{/* 지도 자리 (아직 비어있음) */}</div>
    </div>
  );
};

export default App;

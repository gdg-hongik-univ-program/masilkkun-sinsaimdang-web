import React from "react";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/layout/Sidebar";
import RegionTitle from "../components/post/RegionTitle";
import CategoryTabs from "../components/post/CategoryTabs";
import SortSelector from "../components/post/SortSelector";
import PostList from "../components/post/PostList";

const MainPage = () => {
  return (
    <Layout>
      <Sidebar />
      <div className="main-content">
        <CategoryTabs />
        <div style={{ marginBottom: "16px" }}>
          <SortSelector />
        </div>
        <PostList />
      </div>
    </Layout>
  );
};

export default MainPage;

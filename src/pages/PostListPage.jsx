// PostListPage.jsx (더 이상 전체 페이지 아님!)
import React, { useState } from "react";
import PostList from "../components/post/PostList";
import "./PostListPage.css"; // 필요한 스타일 유지

const PostListPage = ({
  region,
  setRegion,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="post-list-page">
      <div className="top-bar">
        <input
          type="text"
          className="search-input"
          placeholder="지역을 선택해주세요."
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <div className="category-btns">
          {["여행지", "맛집", "카페"].map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="기본순">기본순</option>
          <option value="좋아요순">좋아요순</option>
        </select>
      </div>

      <PostList
        region={region}
        category={selectedCategory}
        sortOrder={sortOrder}
      />
    </div>
  );
};

export default PostListPage;

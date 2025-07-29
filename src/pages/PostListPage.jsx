import React, { useState } from "react";
import PostList from "../components/post/PostList";
import "./PostListPage.css";
import Region from "../components/layout/Region";

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
        <Region />
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

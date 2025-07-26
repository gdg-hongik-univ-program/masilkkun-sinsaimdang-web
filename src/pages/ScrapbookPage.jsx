import React, { useState } from "react";
import PostList from "../components/post/PostList";
import "./ScrapbookPage.css";

const ScrapbookPage = () => {
  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");

  return (
    <div className="scrapbook-page">
      <h2 className="title">스크랩북</h2>

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
        isScrapMode={true}
      />
    </div>
  );
};

export default ScrapbookPage;

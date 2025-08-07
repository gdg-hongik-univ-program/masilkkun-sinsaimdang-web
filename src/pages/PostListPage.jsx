import React, { useState, useEffect } from "react";
import PostList from "../components/post/PostList";
import "./PostListPage.css";
import Region from "../components/layout/Region";
import baseApi from "../api/baseApi";

const PostListPage = ({
  region,
  setRegion,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
}) => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await baseApi.get("/api/articles", {
          params: {
            tag: selectedCategory,
            region: region,
            sort: sortOrder,
          },
        });
        setPosts(res.data.data.content); // API 응답 형식에 따라 수정
      } catch (err) {
        console.error("게시글 로딩 오류:", err);
      }
    };

    fetchPosts();
  }, [selectedCategory, region, sortOrder]);

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

      <PostList posts={posts} />
    </div>
  );
};

export default PostListPage;

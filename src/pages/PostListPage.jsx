import React, { useState, useEffect } from "react";
import PostList from "../components/post/PostList"; // PostList 컴포넌트 사용
import "./PostListPage.css";
import Region from "../components/layout/Region";
import baseApi from "../api/baseApi";

const PostListPage = ({
  region,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await baseApi.get("/articles", {
          params: {
            tag: selectedCategory,
            region: region,
            sort: sortOrder,
          },
        });
        setPosts(res.data.data.content);
      } catch (err) {
        console.error("게시글 로딩 오류:", err);
        console.log(err.response?.data);
      } finally {
        setLoading(false);
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

      {loading ? (
        <div className="loading-container">
          <p>게시글을 불러오는 중...</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
};

export default PostListPage;

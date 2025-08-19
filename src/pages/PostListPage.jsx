import React, { useState, useEffect } from "react";
import PostList from "../components/post/PostList";
import "./PostListPage.css";
import Region from "../components/layout/Region";
import baseApi from "../api/baseApi";
import CategoryFilter from "../components/post/CategoryFilter"; // 👈 추가

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
        const tagMap = {
          여행지: "TRAVEL_SPOT",
          맛집: "RESTAURANT",
          카페: "CAFE",
        };
        const tagsQuery = tagMap[selectedCategory]
          ? tagMap[selectedCategory]
          : "";
        const res = await baseApi.get("/articles", {
          params: {
            tag: tagsQuery,
            region: region || undefined,
            page: 0,
            size: 10,
          },
        });
        setPosts(res.data.data.content);
      } catch (err) {
        console.error("게시글 로딩 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, region]);

  return (
    <div className="post-list-page">
      <div className="top-bar">
        <Region />
      </div>

      <div className="filter-bar">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

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

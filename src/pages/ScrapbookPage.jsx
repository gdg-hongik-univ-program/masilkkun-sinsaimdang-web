import { useCategory } from "../context/CategoryContext";
import { useState, useEffect } from "react";
import Region from "../components/layout/Region";
import PostList from "../components/post/PostList";
import baseApi from "../api/baseApi";
import "./ScrapbookPage.css";

const ScrapbookPage = () => {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [region, setRegion] = useState("");
  const [sortOrder, setSortOrder] = useState("기본순");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchScrapedPosts = async () => {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        console.log("로그인이 필요합니다.");
        return;
      }

      try {
        const tagMap = {
          여행지: "TRAVEL_SPOT",
          맛집: "RESTAURANT",
          카페: "CAFE",
        };

        const tagsQuery = tagMap[selectedCategory] || "";

        const res = await baseApi.post(
          "user/scraps",
          {
            page: 0,
            size: 10,
            sort: "createdAt,desc",
            tag: tagsQuery, // ✅ 선택된 카테고리 필터 적용
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setPosts(res.data.data?.content || []);
      } catch (err) {
        console.error("스크랩 게시글 로딩 오류:", err);
      }
    };

    fetchScrapedPosts();
  }, [selectedCategory]); // ✅ 카테고리 변경 시 API 재호출

  return (
    <div className="scrapbook-page">
      <h2 className="title">스크랩북</h2>

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
        posts={posts}
        region={region}
        category={selectedCategory}
        sortOrder={sortOrder}
        isScrapMode={true}
      />
    </div>
  );
};
export default ScrapbookPage;

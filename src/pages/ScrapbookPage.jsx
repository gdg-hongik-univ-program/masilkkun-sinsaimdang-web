import React, { useState, useEffect } from "react";
import PostList from "../components/post/PostList";
import "./ScrapbookPage.css";
import baseApi from "../api/baseApi"; // API 호출을 위해 baseApi import

const ScrapbookPage = () => {
  const [region, setRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("여행지");
  const [sortOrder, setSortOrder] = useState("기본순");
  const [posts, setPosts] = useState([]); // 스크랩된 게시글을 저장할 상태 추가

  useEffect(() => {
    const fetchScrapedPosts = async () => {
      // API 호출을 위한 토큰 확인
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리디렉션하거나, 에러 처리
        console.log("로그인이 필요합니다.");
        return;
      }

      try {
        const res = await baseApi.get("/scraps", {
          // 스크랩 게시글을 가져오는 API 엔드포인트로 수정
          params: {
            tag: selectedCategory,
            region: region,
            sort: sortOrder,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // API 응답 형식에 따라 posts 상태 업데이트
        // 예시: res.data.data.content에 스크랩된 게시글 목록이 들어있다고 가정
        setPosts(res.data.data.content);
      } catch (err) {
        console.error("스크랩 게시글 로딩 오류:", err);
      }
    };

    // 필터링 옵션이 변경될 때마다 API 호출
    fetchScrapedPosts();
  }, [region, selectedCategory, sortOrder]); // 👈 의존성 배열에 상태 추가

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

      {/* 👈 posts 상태를 PostList 컴포넌트에 props로 전달 */}
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

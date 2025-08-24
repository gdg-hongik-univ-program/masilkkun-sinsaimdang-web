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

  // 스크랩한 게시글 목록 조회
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
        console.log(`[스크랩북] ${selectedCategory} 조회 시작`);

        const regionMap = {
          서울: "서울특별시",
          부산: "부산광역시",
          대구: "대구광역시",
          인천: "인천광역시",
          광주: "광주광역시",
          대전: "대전광역시",
          울산: "울산광역시",
          세종: "세종특별자치시",
          경기: "경기도",
          강원: "강원특별자치도",
          충북: "충청북도",
          충남: "충청남도",
          전북: "전북특별자치도",
          전남: "전라남도",
          경북: "경상북도",
          경남: "경상남도",
          제주: "제주특별자치도",
        };
        const regionQuery = region ? regionMap[region] : undefined;
        // API 엔드포인트 수정 시도
        const res = await baseApi.get("user/scraps", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 0,
            size: 10,
            sort: "createdAt,desc",
            ...(tagsQuery && { tag: tagsQuery }), // tag가 있을 때만 추가
          },
        });

        const postsData = res.data.data?.content || [];
        console.log(
          `[스크랩북] ${selectedCategory} 조회 완료: ${postsData.length}개`
        );

        setPosts(postsData);
      } catch (err) {
        console.error(
          "[스크랩북] API 오류:",
          err.response?.status,
          err.message
        );
      }
    };

    fetchScrapedPosts();
  }, [selectedCategory]);

  // 스크랩 추가/취소 함수
  const handleScrapToggle = async (articleId, isCurrentlyScraped) => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isCurrentlyScraped) {
        console.log(`[스크랩] 취소 시도: ${articleId}`);
        // 스크랩 취소 (DELETE)
        await baseApi.delete(`api/articles/${articleId}/scraps`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 스크랩 목록에서 해당 게시글 제거
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== articleId)
        );
        console.log(`[스크랩] 취소 완료: ${articleId}`);
        alert("스크랩이 취소되었습니다.");
      } else {
        console.log(`[스크랩] 추가 시도: ${articleId}`);
        // 스크랩 추가 (POST)
        await baseApi.post(
          `api/articles/${articleId}/scraps`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`[스크랩] 추가 완료: ${articleId}`);
        alert("스크랩에 추가되었습니다.");
      }
    } catch (err) {
      console.error("[스크랩] 처리 오류:", err.response?.status);
      if (err.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        alert("스크랩 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="scrapbook-page">
      {/* 마이페이지와 같은 스타일의 헤더 */}
      <div className="page-header">
        <h3 className="page-title" style={{ textAlign: "center" }}>
          스크랩북
        </h3>
      </div>

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
        onScrapToggle={handleScrapToggle}
      />
    </div>
  );
};

export default ScrapbookPage;

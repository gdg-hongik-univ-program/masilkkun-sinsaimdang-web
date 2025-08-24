import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaHeart, FaBookmark, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "./PostCoursePage.css";
import baseApi from "../api/baseApi";

const PostCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);

  // ============================
  // ✅ 추가: 리스트와 동기화를 위한 sessionStorage 키/유틸
  // ============================
  const SCRAP_MAP_KEY = "scrapMap"; // { [postId]: true/false }
  const SCRAP_COUNT_MAP_KEY = "scrapCountMap"; // { [postId]: number }

  const readMap = (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  };
  const writeMap = (key, obj) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(obj));
    } catch {}
  };

  const handleGoBack = () => {
    console.log("뒤로가기 버튼 클릭");
    navigate(-1);
  };

  // 좋아요 처리
  const handleLikeToggle = async () => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isLiked) {
        console.log("좋아요 취소 시도:", id);
        await baseApi.delete(`articles/${id}/likes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        console.log("✅ 좋아요 취소 완료");
      } else {
        console.log("좋아요 추가 시도:", id);
        await baseApi.post(
          `articles/${id}/likes`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        console.log("✅ 좋아요 추가 완료");
      }
    } catch (err) {
      console.error("❌ 좋아요 처리 오류:", err);
      console.error("응답 데이터:", err.response?.data);
      if (err.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 스크랩 처리 - 수정된 API 방식
  const handleScrapToggle = async () => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isScraped) {
        console.log("스크랩 취소 시도:", id);
        // DELETE 방식으로 스크랩 취소
        await baseApi.delete(`articles/${id}/scraps`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ============================
        // ✅ 추가: 상태/카운트 & sessionStorage 동기화
        // ============================
        setIsScraped(false);
        setScrapCount((prev) => Math.max(0, prev - 1));

        const m = readMap(SCRAP_MAP_KEY);
        m[id] = false;
        writeMap(SCRAP_MAP_KEY, m);

        const c = readMap(SCRAP_COUNT_MAP_KEY);
        c[id] = Math.max(0, (c[id] ?? scrapCount) - 1);
        writeMap(SCRAP_COUNT_MAP_KEY, c);

        console.log("✅ 스크랩 취소 완료");
        alert("스크랩이 취소되었습니다.");
      } else {
        console.log("스크랩 추가 시도:", id);

        // POST 방식으로 스크랩 추가 - 여러 방법 시도
        try {
          // 방법 1: 빈 객체
          await baseApi.post(
            `articles/${id}/scraps`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (firstError) {
          console.log("방법 1 실패, 방법 2 시도");
          try {
            // 방법 2: null
            await baseApi.post(`articles/${id}/scraps`, null, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (secondError) {
            console.log("방법 2 실패, 방법 3 시도");
            // 방법 3: 데이터 없이
            await baseApi.post(`articles/${id}/scraps`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }

        // ============================
        // ✅ 추가: 상태/카운트 & sessionStorage 동기화
        // ============================
        setIsScraped(true);
        setScrapCount((prev) => prev + 1);

        const m = readMap(SCRAP_MAP_KEY);
        m[id] = true;
        writeMap(SCRAP_MAP_KEY, m);

        const c = readMap(SCRAP_COUNT_MAP_KEY);
        c[id] = (c[id] ?? scrapCount) + 1;
        writeMap(SCRAP_COUNT_MAP_KEY, c);

        console.log("✅ 스크랩 추가 완료");
        alert("스크랩에 추가되었습니다.");
      }
    } catch (err) {
      console.error("❌ 스크랩 처리 오류:", err);
      console.error("에러 상태:", err.response?.status);
      console.error("에러 데이터:", err.response?.data);
      console.error("에러 메시지:", err.response?.data?.message);

      const status = err.response?.status;
      const message = err.response?.data?.message || "";

      if (status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else if (status === 400) {
        // ==========================================
        // ✅ 핵심: 리스트 UI가 뒤쳐졌을 때 한 번에 '취소'
        // (UI는 false였지만 서버는 이미 스크랩 상태 → 바로 DELETE 호출)
        // ==========================================
        if (!isScraped && /이미/.test(message)) {
          try {
            await baseApi.delete(`articles/${id}/scraps`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setIsScraped(false);
            setScrapCount((prev) => Math.max(0, prev - 1));

            const m = readMap(SCRAP_MAP_KEY);
            m[id] = false;
            writeMap(SCRAP_MAP_KEY, m);

            const c = readMap(SCRAP_COUNT_MAP_KEY);
            c[id] = Math.max(0, (c[id] ?? scrapCount) - 1);
            writeMap(SCRAP_COUNT_MAP_KEY, c);

            console.log("✅ (자동) 이미 스크랩 → 즉시 취소 처리 완료");
            return; // 한 번의 클릭으로 종료
          } catch (e2) {
            console.error("자동 취소도 실패:", e2);
          }
        }

        if (isScraped && /스크랩하지\s*않은/.test(message)) {
          // 반대 케이스: UI는 true인데 서버는 이미 취소됨 → UI만 맞춤
          setIsScraped(false);
          setScrapCount((prev) => Math.max(0, prev - 1));

          const m = readMap(SCRAP_MAP_KEY);
          m[id] = false;
          writeMap(SCRAP_MAP_KEY, m);
          return;
        }

        alert("잘못된 요청입니다. 다시 시도해주세요.");
      } else if (status === 409) {
        alert("이미 스크랩된 게시글입니다.");
        setIsScraped(true);
      } else {
        alert("스크랩 처리 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    console.log("=== PostCoursePage useEffect 시작 ===");
    console.log("게시글 ID:", id);

    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log("API 호출 시작: articles/" + id);

        const token =
          sessionStorage.getItem("accessToken") ||
          localStorage.getItem("accessToken");
        console.log("토큰 확인:", token ? "토큰 있음" : "토큰 없음");

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await baseApi.get(`articles/${id}`, { headers });

        console.log("✅ API 응답 성공:", response.data);
        console.log("게시글 데이터:", response.data.data);

        const postData = response.data.data;
        setPost(postData);

        // 좋아요/스크랩 상태 초기화
        setIsLiked(postData.isLiked || false);
        setIsScraped(postData.isScraped || false);
        setLikeCount(postData.likeCount || 0);
        setScrapCount(postData.scrapCount || 0);

        // ==========================================
        // ✅ 추가(권장): 상세 초기 로딩 시 sessionStorage에도 반영
        // → 뒤로가기 했을 때 리스트가 바로 반영됨
        // ==========================================
        const m = readMap(SCRAP_MAP_KEY);
        m[id] = !!postData.isScraped;
        writeMap(SCRAP_MAP_KEY, m);

        const c = readMap(SCRAP_COUNT_MAP_KEY);
        c[id] = Number(postData.scrapCount || 0);
        writeMap(SCRAP_COUNT_MAP_KEY, c);

        console.log("초기 상태 설정:");
        console.log("- 좋아요:", postData.isLiked, "개수:", postData.likeCount);
        console.log(
          "- 스크랩:",
          postData.isScraped,
          "개수:",
          postData.scrapCount
        );
      } catch (err) {
        console.error("❌ 게시글 조회 실패:", err);
        console.error("에러 상태:", err.response?.status);
        console.error("에러 데이터:", err.response?.data);

        if (err.response?.status === 401) {
          setError("로그인이 필요하거나 권한이 없습니다.");
        } else if (err.response?.status === 404) {
          setError("게시글을 찾을 수 없습니다.");
        } else {
          setError("게시글을 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
        console.log("API 호출 완료");
      }
    };

    fetchPost();
  }, [id]);

  // 렌더링 로그
  console.log("=== PostCoursePage 렌더링 ===");
  console.log("현재 상태 - loading:", loading, "error:", error, "post:", post);
  console.log("좋아요 상태:", isLiked, "개수:", likeCount);
  console.log("스크랩 상태:", isScraped, "개수:", scrapCount);

  if (loading) {
    console.log("로딩 중 화면 표시");
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h2>로딩 중...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("에러 화면 표시:", error);
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h2>{error}</h2>
          <button
            onClick={handleGoBack}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B7355",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    console.log("게시글 없음 화면 표시");
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h2>게시글을 찾을 수 없습니다.</h2>
        </div>
      </div>
    );
  }

  console.log("=== 게시글 렌더링 데이터 ===");
  console.log("제목:", post.title);
  console.log("지역:", post.region);
  console.log("장소들:", post.places);
  console.log("태그들:", post.tags);

  return (
    <div className="post-course-page">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft />{" "}
      </button>

      <div className="course-header">
        <h2>{post.region}</h2>
        <h1>{post.title}</h1>
        <p className="date">{post.createdAt?.slice(0, 10)}</p>
      </div>

      <div className="stats">
        <div
          className={`stat-box bookmark-box ${isScraped ? "active" : ""}`}
          onClick={handleScrapToggle}
        >
          <FaBookmark />
          <span>{scrapCount.toLocaleString()}</span>
        </div>
        <div
          className={`stat-box heart-box ${isLiked ? "active" : ""}`}
          onClick={handleLikeToggle}
        >
          <FaHeart />
          <span>{likeCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="tags">
        {post.tags?.map((tag, i) => (
          <button key={i} className="tag-btn">
            #{tag}
          </button>
        ))}
      </div>

      <div className="course-summary">
        {post.places?.map((place, index) => (
          <div className="course-step" key={index}>
            <div className="step-number">{place.placeOrder}</div>
            <div className="step-info">
              <div className="step-info-title">{place.placeName}</div>
              <div className="step-info-sub">{place.address}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="course-detail">
        {post.places?.map((place, index) => (
          <div className="course-detail-item" key={index}>
            <div className="detail-title">
              <div className="step-number">{place.placeOrder}</div>
              {place.placeName}
            </div>
            <div className="detail-sub">{place.address}</div>
            {/* 🔹 place.photoUrl 사용 */}
            <img
              className="detail-img"
              src={place.photoUrl || "/default-image.png"}
              alt={`${place.placeName} 이미지`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-image.png";
              }}
            />
            <div className="detail-text">{place.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCoursePage;

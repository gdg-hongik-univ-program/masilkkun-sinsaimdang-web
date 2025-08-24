// src/pages/PostCoursePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaBookmark, FaArrowLeft } from "react-icons/fa";
import "./PostCoursePage.css";
import baseApi from "../api/baseApi";

const ACTIONS_KEY = "articleActions"; // { [articleId]: { isLiked, isScraped, likeCount, scrapCount } }

const readActions = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ACTIONS_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeActions = (obj) => {
  try {
    sessionStorage.setItem(ACTIONS_KEY, JSON.stringify(obj));
  } catch {}
};

const patchArticleCache = (articleId, patch) => {
  const map = readActions();
  map[String(articleId)] = { ...(map[String(articleId)] || {}), ...patch };
  writeActions(map);
};

const PostCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 표시 상태 + 카운트
  const [isLiked, setIsLiked] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);

  const handleGoBack = () => navigate(-1);

  const ensureToken = () => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return null;
    }
    return token;
  };

  // 좋아요 토글: "숫자 변화 ↔ 색" 동기화
  const handleLikeToggle = async () => {
    const token = ensureToken();
    if (!token) return;

    try {
      if (isLiked) {
        await baseApi.delete(`articles/${id}/likes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikeCount((prev) => {
          const next = Math.max(0, prev - 1);
          setIsLiked(next > 0); // ★ 카운트에 맞춰 색 상태 동기화
          patchArticleCache(id, { isLiked: next > 0, likeCount: next });
          return next;
        });
      } else {
        await baseApi.post(
          `articles/${id}/likes`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikeCount((prev) => {
          const next = prev + 1;
          setIsLiked(next > 0); // ★ 카운트에 맞춰 색 상태 동기화
          patchArticleCache(id, { isLiked: next > 0, likeCount: next });
          return next;
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const status = err.response?.status;

      // 서버-UI 엇갈림 보정
      if (!isLiked && status === 400 && /이미\s*좋아요/i.test(msg)) {
        try {
          await baseApi.delete(`articles/${id}/likes`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLikeCount((prev) => {
            const next = Math.max(0, prev - 1);
            setIsLiked(next > 0);
            patchArticleCache(id, { isLiked: next > 0, likeCount: next });
            return next;
          });
          return;
        } catch {}
      }
      if (isLiked && status === 400 && /좋아요를\s*누르지\s*않은/i.test(msg)) {
        setLikeCount((prev) => {
          const next = Math.max(0, prev - 1);
          setIsLiked(next > 0);
          patchArticleCache(id, { isLiked: next > 0, likeCount: next });
          return next;
        });
        return;
      }

      alert(`좋아요 처리 중 오류가 발생했습니다. ${msg ? `(${msg})` : ""}`);
    }
  };

  // 스크랩 토글: "숫자 변화 ↔ 색" 동기화
  const handleScrapToggle = async () => {
    const token = ensureToken();
    if (!token) return;

    try {
      if (isScraped) {
        await baseApi.delete(`articles/${id}/scraps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScrapCount((prev) => {
          const next = Math.max(0, prev - 1);
          setIsScraped(next > 0); // ★ 카운트에 맞춰 색 상태 동기화
          patchArticleCache(id, { isScraped: next > 0, scrapCount: next });
          return next;
        });
      } else {
        // 서버별 payload 요구 대응
        try {
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
        } catch {
          await baseApi.post(`articles/${id}/scraps`, null, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setScrapCount((prev) => {
          const next = prev + 1;
          setIsScraped(next > 0); // ★ 카운트에 맞춰 색 상태 동기화
          patchArticleCache(id, { isScraped: next > 0, scrapCount: next });
          return next;
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "";

      if (status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }
      if (status === 400) {
        // 상태 불일치 보정
        if (!isScraped && /이미\s*스크랩/i.test(message)) {
          try {
            await baseApi.delete(`articles/${id}/scraps`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setScrapCount((prev) => {
              const next = Math.max(0, prev - 1);
              setIsScraped(next > 0);
              patchArticleCache(id, { isScraped: next > 0, scrapCount: next });
              return next;
            });
            return;
          } catch {}
        }
        if (isScraped && /스크랩하지\s*않은/i.test(message)) {
          setScrapCount((prev) => {
            const next = Math.max(0, prev - 1);
            setIsScraped(next > 0);
            patchArticleCache(id, { isScraped: next > 0, scrapCount: next });
            return next;
          });
          return;
        }
        alert("잘못된 요청입니다. 다시 시도해주세요.");
        return;
      }
      if (status === 409) {
        alert("이미 스크랩된 게시글입니다.");
        setIsScraped(true);
        patchArticleCache(id, { isScraped: true });
        return;
      }

      alert("스크랩 처리 중 오류가 발생했습니다.");
    }
  };

  // 상세 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        const token =
          sessionStorage.getItem("accessToken") ||
          localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await baseApi.get(`articles/${id}`, { headers });
        const postData = res.data?.data;
        setPost(postData);

        // 서버 값으로 초기 상태 세팅
        const like0 = Number(postData?.likeCount || 0);
        const scrap0 = Number(postData?.scrapCount || 0);
        const liked0 = !!postData?.isLiked;
        const scraped0 = !!postData?.isScraped;

        setLikeCount(like0);
        setScrapCount(scrap0);

        // 숫자와 색을 함께 맞춤: 서버 불리언 우선, 없으면 카운트 기준
        setIsLiked(typeof postData?.isLiked === "boolean" ? liked0 : like0 > 0);
        setIsScraped(
          typeof postData?.isScraped === "boolean" ? scraped0 : scrap0 > 0
        );

        // ✅ 상세 진입 시 캐시 시드 (목록에서도 색 유지)
        patchArticleCache(id, {
          isLiked: typeof postData?.isLiked === "boolean" ? liked0 : like0 > 0,
          isScraped:
            typeof postData?.isScraped === "boolean" ? scraped0 : scrap0 > 0,
          likeCount: like0,
          scrapCount: scrap0,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          setError("로그인이 필요하거나 권한이 없습니다.");
        } else if (err.response?.status === 404) {
          setError("게시글을 찾을 수 없습니다.");
        } else {
          setError("게시글을 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>로딩 중...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>{error}</h2>
          <button
            onClick={handleGoBack}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              backgroundColor: "#8B7355",
              color: "white",
              border: "none",
              borderRadius: 8,
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
    return (
      <div className="post-course-page">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft />
          <span>뒤로가기</span>
        </button>
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>게시글을 찾을 수 없습니다.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="post-course-page">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft />
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
            <img
              className="detail-img"
              src={post.photos?.[index] || "/default-image.png"}
              alt={`썸네일${index + 1}`}
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

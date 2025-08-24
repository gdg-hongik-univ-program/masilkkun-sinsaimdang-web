import React, { useState, useEffect, useMemo } from "react";
import "./PostCard.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false); // 표시 상태
  const [bookmarked, setBookmarked] = useState(false); // 표시 상태
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [bookmarkCount, setBookmarkCount] = useState(post.scrapCount || 0);

  const navigate = useNavigate();

  console.log("🔥 post.photos:", post.photos);

  // 🔸 리스트가 상세에서의 변경을 알고 시작하도록 초기 동기화
  useEffect(() => {
    setLiked(!!post.isLiked);
    setBookmarked(!!post.isScraped);
    setLikeCount(post.likeCount ?? 0);
    setBookmarkCount(post.scrapCount ?? 0);
  }, [post.id, post.isLiked, post.isScraped, post.likeCount, post.scrapCount]);

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    const authorId = post.author?.id || post.authorId;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const safeGetToken = () => {
    try {
      if (typeof window !== "undefined") {
        return (
          (typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("accessToken")
            : null) ||
          (typeof localStorage !== "undefined"
            ? localStorage.getItem("accessToken")
            : null)
        );
      }
    } catch (_) {}
    return null;
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const token = safeGetToken();
    if (!token) {
      alert("로그인이 필요합니다. (좋아요)");
      return;
    }

    try {
      if (!liked) {
        await baseApi.post(`/articles/${post.id}/likes`);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        await baseApi.delete(`/articles/${post.id}/likes`);
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const status = err.response?.status;

      // 서버는 이미 좋아요 상태인데 UI가 뒤쳐져 있었다면 → 즉시 취소 호출
      if (!liked && status === 400 && /이미\s*좋아요/i.test(msg)) {
        try {
          await baseApi.delete(`/articles/${post.id}/likes`);
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
          return;
        } catch {}
      }

      // 반대로 UI는 true인데 서버는 이미 취소됨
      if (liked && status === 400 && /좋아요를\s*누르지\s*않은/i.test(msg)) {
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        return;
      }

      alert(`좋아요 처리 중 오류가 발생했습니다. ${msg ? `(${msg})` : ""}`);
    }
  };

  const toggleBookmark = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const token = safeGetToken();
    if (!token) {
      alert("로그인이 필요합니다. (스크랩)");
      return;
    }

    try {
      if (!bookmarked) {
        // 스크랩 추가
        await baseApi.post(`/articles/${post.id}/scraps`);
        setBookmarked(true);
        setBookmarkCount((prev) => prev + 1);
      } else {
        // 스크랩 취소
        await baseApi.delete(`/articles/${post.id}/scraps`);
        setBookmarked(false);
        setBookmarkCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const status = err.response?.status;

      // 🔥 상세에서 이미 스크랩된 상태로 뒤로 왔는데 카드 UI가 늦게 동기화된 경우
      // 첫 클릭이 '취소' 의도이므로 400 "이미 스크랩"이면 바로 DELETE 실행
      if (!bookmarked && status === 400 && /이미\s*스크랩/i.test(msg)) {
        try {
          await baseApi.delete(`/articles/${post.id}/scraps`);
          setBookmarked(false);
          setBookmarkCount((prev) => Math.max(0, prev - 1));
          return; // 한 번의 클릭으로 취소 끝
        } catch {}
      }

      // 반대로 UI는 true인데 서버는 이미 취소됨
      if (bookmarked && status === 400 && /스크랩하지\s*않은/i.test(msg)) {
        setBookmarked(false);
        setBookmarkCount((prev) => Math.max(0, prev - 1));
        return;
      }

      alert(`스크랩 처리 중 오류가 발생했습니다. ${msg ? `(${msg})` : ""}`);
    }
  };

  const tagMap = {
    RESTAURANT: "맛집",
    CAFE: "카페",
    TRAVEL: "여행지",
    ACTIVITY: "액티비티",
    SHOPPING: "쇼핑",
    CULTURE: "문화",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "날짜 없음";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}년 ${month}월 ${day}일`;
    } catch {
      return "날짜 없음";
    }
  };

  const getAuthorName = () => {
    return (
      post.author?.nickname || post.author?.name || post.authorName || "익명"
    );
  };

  const handleImageError = (e) => {
    if (e.target.src.includes("default-image.png")) return; // 이미 기본 이미지면 중단
    e.target.src = "/default-image.png";
  };

  const handleProfileImageError = (e) => {
    // 이미 기본 이미지면 중단
    if (e.target.src.includes("default-profile.png")) return;
    e.target.src = "/default-profile.png";
  };

  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return "제목 없음";
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      {/* 상단 이미지 섹션 */}
      <div className="post-header">
        <div className="post-images">
          <img
            src={post.places?.[0]?.photoUrl || "/default-image.png"}
            alt={post.title || "게시글 이미지"}
            onError={handleImageError}
            className="main-image"
            loading="lazy"
          />
          {post.places?.[1]?.photoUrl ? (
            <img
              src={post.places[1].photoUrl}
              alt={`${post.title || "게시글"} 서브 이미지`}
              className="sub-image"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="sub-image-placeholder" />
          )}
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="post-content">
        <div className="profile-date-section">
          <img
            src={post.author?.profileImageUrl || "/default-profile.png"}
            alt={`${getAuthorName()} 프로필`}
            className="profile-img"
            onError={handleProfileImageError}
            onClick={handleProfileClick}
            loading="lazy"
            style={{ cursor: "pointer" }}
          />
          <p className="post-date">
            {getAuthorName()} • {formatDate(post.createdAt)}
          </p>
        </div>

        <h3 className="post-title" title={post.title || "제목 없음"}>
          {truncateTitle(post.title)}
        </h3>

        <div className="post-bottom">
          <div className="post-tags">
            {post.tags &&
              post.tags.length > 0 &&
              post.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="tag"
                  title={`#${tagMap[tag] || tag}`}
                >
                  #{tagMap[tag] || tag}
                </span>
              ))}
          </div>

          <div className="post-actions">
            <button
              className={`action-btn bookmark-btn ${
                bookmarked ? "active" : ""
              }`}
              onClick={toggleBookmark}
              aria-label={`북마크 ${bookmarked ? "해제" : "추가"}`}
              title={`북마크 ${bookmarked ? "해제" : "추가"}`}
            >
              <FaBookmark />
              <span>{formatCount(bookmarkCount)}</span>
            </button>
            <button
              className={`action-btn like-btn ${liked ? "active" : ""}`}
              onClick={toggleLike}
              aria-label={`좋아요 ${liked ? "해제" : "추가"}`}
              title={`좋아요 ${liked ? "해제" : "추가"}`}
            >
              <FaHeart />
              <span>{formatCount(likeCount)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

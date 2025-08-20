import React, { useState } from "react";
import "./PostCard.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [bookmarkCount, setBookmarkCount] = useState(post.scrapCount || 0);

  const navigate = useNavigate();

  const handleCardClick = () => {
    // PostCoursePage로 이동
    navigate(`/post/${post.id}`);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    const authorId = post.author?.id || post.authorId;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const toggleLike = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleBookmark = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setBookmarked((prev) => !prev);
    setBookmarkCount((prev) => (bookmarked ? prev - 1 : prev + 1));
  };

  const tagMap = {
    RESTAURANT: "맛집",
    CAFE: "카페",
    TRAVEL: "여행지",
    ACTIVITY: "액티비티",
    SHOPPING: "쇼핑",
    CULTURE: "문화",
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";

    try {
      const date = new Date(dateString);

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "날짜 없음";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 없음";
    }
  };

  // 작성자 이름 가져오기 함수
  const getAuthorName = () => {
    return (
      post.author?.nickname || post.author?.name || post.authorName || "익명"
    );
  };

  // 이미지 로드 에러 핸들링 - 깜빡임 방지
  const handleImageError = (e) => {
    e.target.style.opacity = "0";
    setTimeout(() => {
      e.target.src = "/default-image.png";
      e.target.style.opacity = "1";
    }, 100);
  };

  const handleProfileImageError = (e) => {
    e.target.style.opacity = "0";
    setTimeout(() => {
      e.target.src = "/default-profile.png";
      e.target.style.opacity = "1";
    }, 100);
  };

  // 제목 길이 제한
  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return "제목 없음";
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  // 숫자 포맷팅
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      {/* 상단 이미지 섹션만 */}
      <div className="post-header">
        <div className="post-images">
          <img
            src={post.photos?.[0] || "/default-image.png"}
            alt={`${post.title || "게시글"} 메인 이미지`}
            className="main-image"
            onError={handleImageError}
            loading="lazy"
          />
          {post.photos?.[1] ? (
            <img
              src={post.photos[1]}
              alt={`${post.title || "게시글"} 서브 이미지`}
              className="sub-image"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="sub-image-placeholder">
              {/* 두 번째 이미지가 없을 때 회색 영역 */}
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="post-content">
        {/* 프로필과 작성자/날짜 섹션 */}
        <div className="profile-date-section">
          <img
            src={post.author?.profileImage || "/default-profile.png"}
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

        {/* 제목 */}
        <h3 className="post-title" title={post.title || "제목 없음"}>
          {truncateTitle(post.title)}
        </h3>

        {/* 태그와 액션 버튼을 같은 선상에 배치 */}
        <div className="post-bottom">
          {/* 왼쪽 태그 섹션 */}
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

          {/* 오른쪽 액션 버튼 섹션 */}
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

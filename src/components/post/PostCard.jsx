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
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      <div className="post-images">
        <img
          src={post.photos?.[0] || "/default-image.png"}
          alt="메인 이미지"
          className="post-image main-image"
        />
        {post.photos?.[1] && (
          <img
            src={post.photos[1]}
            alt="서브 이미지"
            className="post-image sub-image"
          />
        )}
      </div>

      <div className="post-info">
        <div className="profile-section">
          <img
            src={post.author?.profileImage || "/default-profile.png"}
            alt="프로필"
            className="profile-img"
          />
          <div className="user-info">
            <p className="user-name">{post.author?.nickname || "알 수 없음"}</p>
            <p className="post-date">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        <h3 className="post-location">{post.title}</h3>

        <div className="post-tags">
          {post.tags?.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tagMap[tag] || tag}
            </span>
          ))}
        </div>

        <div className="post-actions">
          <button
            className={`action-btn bookmark-btn ${bookmarked ? "active" : ""}`}
            onClick={toggleBookmark}
            aria-label="북마크"
          >
            <FaBookmark />
            <span>{bookmarkCount.toLocaleString()}</span>
          </button>
          <button
            className={`action-btn like-btn ${liked ? "active" : ""}`}
            onClick={toggleLike}
            aria-label="좋아요"
          >
            <FaHeart />
            <span>{likeCount.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

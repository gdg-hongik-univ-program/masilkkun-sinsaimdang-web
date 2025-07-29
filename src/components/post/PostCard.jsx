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
    navigate(`/app/post/${post.id}`);
  };

  const toggleLike = (e) => {
    e.stopPropagation(); // 카드 클릭 방지
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked((prev) => !prev);
    setBookmarkCount((prev) => (bookmarked ? prev - 1 : prev + 1));
  };

  // 태그 변환 (영어 -> 한글)
  const tagMap = {
    RESTAURANT: "맛집",
    CAFE: "카페",
    TRAVEL: "여행지",
  };

  return (
    <div
      className="post-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* 이미지 */}
      <div className="post-images">
        <img src={post.photos?.[0]} alt="이미지1" className="post-image" />
        <img src={post.photos?.[1]} alt="이미지2" className="post-image" />
      </div>

      <div className="post-info">
        {/* 작성자 정보 */}
        <div className="profile-section">
          <img
            src="/default-profile.png" // 백엔드에 프로필 이미지가 없으므로 기본 이미지
            alt="프로필"
            className="profile-img"
          />
          <div className="user-info">
            <p className="user-name">{post.author?.nickname || "알 수 없음"}</p>
            <p className="post-date">
              {post.createdAt?.slice(0, 10) || "날짜 없음"}
            </p>
          </div>
        </div>

        {/* 제목 또는 지역 */}
        <p className="post-location">{post.title}</p>

        {/* 태그 */}
        <div className="post-tags">
          {post.tags?.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tagMap[tag] || tag}
            </span>
          ))}
        </div>

        {/* 좋아요 / 스크랩 */}
        <div className="post-actions">
          <div className="action" onClick={toggleBookmark}>
            <FaBookmark color={bookmarked ? "#000" : "#aaa"} />
            <span>{bookmarkCount.toLocaleString()}</span>
          </div>
          <div className="action" onClick={toggleLike}>
            <FaHeart color={liked ? "red" : "#aaa"} />
            <span>{likeCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

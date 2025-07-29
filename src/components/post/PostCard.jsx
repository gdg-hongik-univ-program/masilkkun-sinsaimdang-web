import React, { useState } from "react";
import "./PostCard.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarkCount);
  const allowedTags = ["여행지", "맛집", "카페"];


  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/app/post/${post.id}`);
  };


  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleBookmark = () => {
    setBookmarked((prev) => !prev);
    setBookmarkCount((prev) => (bookmarked ? prev - 1 : prev + 1));
  };

  return (

    <div
      className="post-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >

      <div className="post-images">
        <img src={post.image1} alt="이미지1" className="post-image" />
        <img src={post.image2} alt="이미지2" className="post-image" />
      </div>

      <div className="post-info">
        <div className="profile-section">
          <img src={post.profileImg} alt="프로필" className="profile-img" />
          <div className="user-info">
            <p className="user-name">{post.author}</p>
            <p className="post-date">{post.date}</p>
          </div>
        </div>

        <p className="post-location">장소이름 {post.location}</p>

        <div className="post-tags">
          {post.tags
            .filter((tag) => allowedTags.includes(tag))
            .map((tag, idx) => (
              <span key={idx} className="tag">
                #{tag}
              </span>
            ))}
        </div>

        <div className="post-actions">
          <div
            className="action"
            onClick={toggleBookmark}
            style={{ cursor: "pointer" }}
          >
            <FaBookmark color={bookmarked ? "#000" : "#aaa"} />
            <span>{bookmarkCount.toLocaleString()}</span>
          </div>
          <div
            className="action"
            onClick={toggleLike}
            style={{ cursor: "pointer" }}
          >
            <FaHeart color={liked ? "red" : "#aaa"} />
            <span>{likeCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

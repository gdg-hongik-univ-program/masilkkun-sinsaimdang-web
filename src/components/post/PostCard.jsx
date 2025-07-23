import React from "react";
import "./PostCard.css";
import { FaHeart, FaBookmark } from "react-icons/fa";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      {/* 썸네일 이미지 */}
      <div className="post-thumbnails">
        <img src={post.image1} alt="thumb1" className="thumb-img" />
        <img src={post.image2} alt="thumb2" className="thumb-img" />
      </div>

      {/* 프로필 이미지 */}
      <img
        src={post.authorImg}
        alt="profile"
        className="postcard-profile-img"
      />

      <div className="post-content">
        <div className="author-info">
          <span className="author-name">{post.author}</span>
          <span className="dot">•</span>
          <span className="post-date">{post.date}</span>
        </div>

        <div className="post-title">{post.title}</div>

        <div className="post-tags">
          {post.tags.map((tag, i) => (
            <span key={i} className="tag">
              #{tag}
            </span>
          ))}
        </div>

        <div className="post-actions">
          <div className="action-btn">
            <FaBookmark /> <span>{post.scrap}</span>
          </div>
          <div className="action-btn">
            <FaHeart /> <span>{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

import React from "react";
import "./PostCard.css";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      {/* ✅ 썸네일 이미지 2개 */}
      <div className="thumbnail-section">
        <img src={post.image1} alt="썸네일1" className="thumbnail" />
        <img src={post.image2} alt="썸네일2" className="thumbnail" />
        {/* post.image1, post.image2 → 백엔드에서 URL 형태로 전달 */}
      </div>

      {/* ✅ 게시글 본문 내용 */}
      <div className="content-section">
        <div className="author-info">
          {/* ✅ 프로필 이미지 */}
          <img src={post.profileImg} alt="프로필" className="profile-img" />
          {/* ✅ 작성자명 */}
          <span className="author-name">{post.author}</span>
          <span className="dot">·</span>
          {/* ✅ 작성일 */}
          <span className="date">{post.date}</span>
          <button className="more-btn">⋯</button>
        </div>

        {/* ✅ 게시글 제목 */}
        <h3 className="post-title">{post.title}</h3>

        {/* ✅ 태그들 */}
        <div className="post-tags">
          {post.tags.map((tag, i) => (
            <span key={i} className="tag">
              #{tag}
            </span>
          ))}
          {/* post.tags는 문자열 배열 ex) ["여행지", "한옥", "산책"] */}
        </div>

        {/* ✅ 포인트와 좋아요 */}
        <div className="post-footer">
          <span className="point">💰 {post.point}</span>
          <span className="likes">❤️ {post.likes}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

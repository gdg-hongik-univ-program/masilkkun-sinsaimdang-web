import React from "react";
import PostCard from "./PostCard"; // PostCard import 추가
import "./PostList.css";

const PostList = ({ posts }) => {
  // posts가 undefined이거나 배열이 아닐 경우를 대비
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="post-list-empty">
        <p>게시글이 없습니다.</p>
        <p>다른 카테고리나 지역을 선택해보세요.</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostList;

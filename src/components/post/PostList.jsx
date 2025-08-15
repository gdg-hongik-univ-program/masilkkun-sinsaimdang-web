import React from "react";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import baseApi from "../../api/baseApi";
import "./PostList.css";

const PostList = ({ posts }) => {
  // posts가 undefined이거나 배열이 아닐 경우를 대비
  if (!posts || !Array.isArray(posts)) {
    return <div className="post-list">게시물이 없습니다.</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

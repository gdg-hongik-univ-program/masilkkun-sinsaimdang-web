import React from "react";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import baseApi from "../../api/baseApi";
import "./PostList.css";

const PostList = ({ posts }) => {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

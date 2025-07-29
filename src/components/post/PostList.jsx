import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import baseApi from "../../api/baseApi"; // ✅ API 모듈 불러오기
import "./PostList.css";

const PostList = ({ region, category, sortOrder }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await baseApi.get("/articles", {
          params: { region, category, sort: sortOrder },
        });

        const data = res.data.data.content; // ✅ API 응답 구조에 따라 조정
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
          console.error("응답이 배열이 아님:", data);
        }
      } catch (err) {
        console.error("게시글 요청 실패:", err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [region, category, sortOrder]);

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

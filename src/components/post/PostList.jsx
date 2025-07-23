import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";

const PostList = ({ region, category, sortOrder }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts", {
          params: {
            region,
            category,
            sort: sortOrder,
          },
        });

        const data = res.data;
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("응답이 배열이 아닙니다:", data);
          setPosts([]);
        }
      } catch (error) {
        console.error("게시글 불러오기 실패", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [region, category, sortOrder]); // 검색 조건이 바뀌면 재요청

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

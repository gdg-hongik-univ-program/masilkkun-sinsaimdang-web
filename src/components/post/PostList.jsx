import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";

import "./PostList.css";

const PostList = ({ region, category, sortOrder }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        image1: "https://placehold.co/200x180?text=Image1",
        image2: "https://placehold.co/200x180?text=Image2",
        profileImg: "https://placehold.co/40x40?text=User",
        author: "개굴히",
        date: "2000년 00월 00일",
        location: "수원화성",
        tags: ["여행지", "맛집", "카페"],
        bookmarkCount: 0,
        likeCount: 0,
      },
      {
        id: 2,
        image1: "https://placehold.co/200x180?text=A",
        image2: "https://placehold.co/200x180?text=B",
        profileImg: "https://placehold.co/40x40?text=H",
        author: "홍길동",
        date: "2024년 05월 01일",
        location: "서울 경복궁",
        tags: ["역사", "산책", "궁궐"],
        bookmarkCount: 0,
        likeCount: 0,
      },
    ];

    setPosts(mockData);
  }, []);

  // const fetchPosts = async () => {
  //   try {
  //     const res = await baseApi.get("/api/posts", {
  //       params: {
  //         region,
  //         category,
  //         sort: sortOrder,
  //       },
  //     });

  //     const data = res.data;
  //     if (Array.isArray(data)) {
  //       setPosts(data);
  //     } else {
  //       console.error("응답이 배열이 아닙니다:", data);
  //       setPosts([]);
  //     }
  //   } catch (error) {
  //     console.error("게시글 불러오기 실패", error);
  //     setPosts([]);
  //   }
  // };

  //   fetchPosts();
  // }, [region, category, sortOrder]);

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

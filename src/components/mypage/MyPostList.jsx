import { useEffect, useState } from "react";
import PostCard from "../post/PostCard";
import "./MyPostList.css";
import baseApi from "../../api/baseApi";

//mockdata 나중에 지워야함!!
// const mockMyPosts = [
//   {
//     id: 1,
//     image1: "https://placehold.co/200x180?text=Image1",
//     image2: "https://placehold.co/200x180?text=Image2",
//     profileImg: "https://placehold.co/40x40?text=User",
//     author: "마실꾼",
//     date: "2000년 00월 00일",
//     location: "수원화성",
//     tags: ["여행지", "맛집", "카페"],
//     bookmarkCount: 0,
//     likeCount: 0,
//   },
// ];

const MyPostList = () => {
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await baseApi.get("/articles");
        const data = res.data.data.content;

        if (Array.isArray(data)) {
          setMyPosts(data);
        } else {
          setMyPosts([]);
          console.error("응답 데이터가 배열이 아님:", data);
        }
      } catch (error) {
        console.error("내 게시글 불러오기 실패:", error);
        setMyPosts([]);
      }
    };

    fetchMyPosts();
  }, []);

  return (
    <div className="my-post-list">
      {myPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default MyPostList;

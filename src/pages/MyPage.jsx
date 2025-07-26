import React from "react";
import ProfileHeader from "../components/mypage/ProfileHeader";
import MyPostList from "../components/mypage/MyPostList";
import "./MyPage.css";

const MyPage = () => {
  return (
    <div className="my-page">
      <ProfileHeader />

      <div className="my-posts-header">
        <h3>내 게시글</h3>
        <button className="delete-btn">삭제</button>
      </div>

      <MyPostList />
    </div>
  );
};

export default MyPage;

import React, { useEffect, useState } from "react";
import baseApi from "../../api/baseApi";
import "./ProfileHeader.css";

// mockdata로 지워야 할 부분이다.
const mockUser = {
  nickname: "개굴히",
  profileImageUrl: "/img/profile.png",
  followerCount: 100,
  followingCount: 50,
};

const ProfileHeader = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(mockUser);
    });

    return () => clearTimeout(timer);
  }, []);

  // 실제 api 연동하는 부분!!!!!
  /* const fetchProfile = async () => {
      try {
        const res = await baseApi.get("/user/me"); // ← 실제 API 경로에 맞게 수정
        setUser(res.data);
      } catch (err) {
        console.error("프로필 불러오기 실패:", err);
      }
    };

    fetchProfile();
  }, []); */

  if (!user) return <p>프로필 불러오는 중...</p>;

  return (
    <div className="profile-header">
      <img
        className="profile-img"
        src={user.profileImageUrl || "/img/profile.png"}
        alt="프로필들어갈자리입니다아아아ㅏ"
      />
      <h3 className="nickname">{user.nickname}</h3>
      <button className="edit-btn">수정</button>
      <div className="follow-info">
        <span>팔로워 {user.followerCount}</span>
        <span>팔로잉 {user.followingCount}</span>
      </div>
    </div>
  );
};

export default ProfileHeader;

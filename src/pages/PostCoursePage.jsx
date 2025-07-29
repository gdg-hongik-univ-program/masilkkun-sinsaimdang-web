import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./PostCoursePage.css";
import baseApi from "../api/baseApi";

// // 더미 데이터
// const dummyPosts = [
//   {
//     id: "1",
//     title: "수원화성 하루 코스 여행",
//     author: "개굴히",
//     date: "2000년 00월 00일",
//     location: "수원화성",
//     tags: ["여행지", "맛집", "카페"],
//     image1: "https://via.placeholder.com/200x150?text=Image1",
//     image2: "https://via.placeholder.com/200x150?text=Image2",
//     profileImg: "",
//     content: "여기는 수원에 있는 화성으로 경기도 화성시와 다른 곳입니다. ...",
//     likeCount: 10,
//     bookmarkCount: 5,
//     courseSummary: [
//       { name: "수원화성", address: "경기도 수원시 팔달구 장안동" },
//       { name: "화성행궁", address: "경기도 수원시 팔달구 중동" },
//       { name: "연무대", address: "경기도 수원시 장안구 영화동" },
//     ],
//     courseDetail: [
//       {
//         title: "역사와 문화가 살아 숨 쉬는 수원화성",
//         placeName: "수원화성",
//         address: "경기도 수원시 팔달구 장안동",
//         image: "https://via.placeholder.com/400x250?text=수원화성",
//         description: "조선시대 정조가 만든 아름다운 성곽 도시입니다...",
//       },
//     ],
//   },
//   {
//     id: "2",
//     title: "경복궁 도보 여행 코스",
//     author: "홍길동",
//     date: "2024년 05월 01일",
//     location: "서울 경복궁",
//     tags: ["여행지"],
//     image1: "https://via.placeholder.com/200x150?text=A",
//     image2: "https://via.placeholder.com/200x150?text=B",
//     profileImg: "",
//     content: "경복궁은 조선시대의 궁궐로 ...",
//     likeCount: 20,
//     bookmarkCount: 15,
//     courseSummary: [
//       { name: "광화문", address: "서울 종로구 세종로" },
//       { name: "경복궁", address: "서울 종로구 사직로" },
//       { name: "국립민속박물관", address: "서울 종로구 삼청로" },
//     ],
//     courseDetail: [
//       {
//         title: "경복궁의 역사",
//         placeName: "경복궁",
//         address: "서울 종로구 사직로",
//         image: "https://via.placeholder.com/400x250?text=경복궁",
//         description:
//           "조선 왕조의 중심 궁궐로, 정전인 근정전은 국보로 지정됨...",
//       },
//     ],
//   },
// ];
//여기까지 더미데이터

const PostCoursePage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get(`/articles/${id}`);
        setPost(response.data.data); // ✅ 응답 구조에 따라 data 안에서 꺼냄
      } catch (err) {
        console.error("게시글 조회 실패", err);
        setError("게시글을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다..</div>;

  return (
    <div className="post-course-page">
      {/* 상단 헤더 */}
      <div className="course-header">
        <h2>{post.region}</h2>
        <h1>{post.title}</h1>
        <p className="date">{post.createdAt?.slice(0, 10)}</p>
      </div>

      {/* 프로필 */}
      <div className="profile-section">
        <img
          className="profile-img"
          src={post.author?.profileImg || "/default-profile.png"}
          alt="프로필"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-profile.png";
          }}
        />

        <div className="username">{post.author?.nickname}</div>
        <button className="follow-btn">팔로우</button>
      </div>

      {/* 좋아요 / 북마크 */}
      <div className="stats">
        <div className="stat-box">
          <span>🔖</span>
          <span>{post.scrapCount?.toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span>❤️</span>
          <span>{post.likeCount?.toLocaleString()}</span>
        </div>
      </div>

      {/* 태그 */}
      <div className="tags">
        {post.tags?.map((tag, i) => (
          <button key={i} className="tag-btn">
            #{tag}
          </button>
        ))}
      </div>

      {/* 요약 코스 목록 */}
      <div className="course-summary">
        {post.places?.map((place, index) => (
          <div className="course-step" key={index}>
            <div className="step-number">{place.placeOrder}</div>
            <div className="step-info">
              <div className="step-info-title">{place.placeName}</div>
              <div className="step-info-sub">{place.address}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 코스 설명 */}
      <div className="course-detail">
        {post.places?.map((place, index) => (
          <div className="course-detail-item" key={index}>
            <div className="detail-title">
              <div className="step-number">{place.placeOrder}</div>
              {place.placeName}
            </div>
            <div className="detail-sub">{place.address}</div>
            <img
              className="detail-img"
              src={post.photos?.[index] || "/default-image.png"}
              alt={`썸네일${index + 1}`}
            />
            <div className="detail-text">{place.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCoursePage;

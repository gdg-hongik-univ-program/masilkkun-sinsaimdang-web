
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCreatePage.css";
import baseApi from "../api/baseApi"; 

const PostCreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [region, setRegion] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    const newPost = {
      title,
      content,
      region,
      author: "임시작성자", // TODO: 로그인 사용자 정보로 교체해야한다...
      date: new Date().toLocaleDateString(),
      profileImg: "",
      tags: ["태그"],
      image1: "https://via.placeholder.com/200x150?text=1",
      image2: "https://via.placeholder.com/200x150?text=2",
      likeCount: 0,
      bookmarkCount: 0,
      courseSummary: [],
      courseDetail: [],
    };

    try {
      const response = await baseApi.post("/api/posts", newPost);
      const createdPost = response.data;

      // 게시글 등록 후 상세 페이지로 이동
      navigate(`/postcourse/${createdPost.id}`, {
        state: { post: createdPost },
      });
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다.");
    }
  };

  return (
    <div className="post-create-container">
      <select
        className="post-create-region-select"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="">지역을 선택해주세요.</option>
        <option value="서울">서울</option>
        <option value="부산">부산</option>
        <option value="제주">제주</option>
        <option value="경기">경기</option>
        <option value="경상">경상</option>
      </select>

      <input
        type="text"
        placeholder="제목을 입력해주세요."
        className="post-create-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button className="post-create-tag-button">+ 태그 추가</button>

      <div className="post-create-place-section">
        <div className="post-create-place-title">
          <span className="post-create-step-number">1</span>
          장소 이름을 입력해주세요.
        </div>

        <div className="post-create-upload-box">
          <div className="post-create-image-box">
            <span className="post-create-image-placeholder">
              사진을 업로드해주세요.
            </span>
          </div>

          <textarea
            className="post-create-description-input"
            placeholder="설명을 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button className="post-create-register-place">장소 등록하기</button>
      </div>

      <button className="post-create-add-place-button">+ 장소 추가</button>

      <div className="post-create-bottom-buttons">
        <button className="post-create-draft-button">임시저장</button>
        <button className="post-create-submit-button" onClick={handleSubmit}>
          게시
        </button>
      </div>
    </div>
  );
};

export default PostCreatePage;

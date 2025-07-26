import React from "react";
import "./PostCreatePage.css";

const PostCreatePage = () => {
  return (
    <div className="post-create-container">
      <select className="post-create-region-select">
        <option value="">지역을 선택해주세요.</option>
        <option value="서울">서울</option>
        <option value="부산">부산</option>
        <option value="제주">제주</option>
      </select>

      <input
        type="text"
        placeholder="제목을 입력해주세요."
        className="post-create-title-input"
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
          />
        </div>

        <button className="post-create-register-place">장소 등록하기</button>
      </div>

      <button className="post-create-add-place-button">+ 장소 추가</button>

      <div className="post-create-bottom-buttons">
        <button className="post-create-draft-button">임시저장</button>
        <button className="post-create-submit-button">게시</button>
      </div>
    </div>
  );
};

export default PostCreatePage;

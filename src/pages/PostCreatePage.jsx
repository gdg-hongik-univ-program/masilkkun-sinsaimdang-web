import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCreatePage.css";
import baseApi from "../api/baseApi";
import Region from "../components/layout/Region";

const PostCreatePage = () => {
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [tags, setTags] = useState([]);

  const [places, setPlaces] = useState([{ image: null, description: "" }]);

  const navigate = useNavigate();

  const tagOptions = ["여행지", "맛집", "카페"];
  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updated = [...places];
      updated[index].image = imageUrl;
      setPlaces(updated);
    }
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...places];
    updated[index].description = value;
    setPlaces(updated);
  };

  const handleAddPlace = () => {
    setPlaces([...places, { image: null, description: "" }]);
  };

  const handleTempSave = () => {
    const temp = {
      title,
      region,
      tags,
      places,
    };
    localStorage.setItem("tempPost", JSON.stringify(temp));
    alert("임시 저장되었습니다!");
  };

  const handleSubmit = async () => {
    const newPost = {
      title,
      content: "",
      region,
      author: "임시작성자",
      date: new Date().toLocaleDateString(),
      profileImg: "",
      tags,
      image1: places[0]?.image || null,
      image2: places[1]?.image || null,
      likeCount: 0,
      bookmarkCount: 0,
      courseSummary: places,
      courseDetail: [],
    };

    try {
      const response = await baseApi.post("/articles", newPost); //api연결부분
      const createdPost = response.data;
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
      <div className="top-bar">
        <Region setRegion={setRegion} />
      </div>

      <input
        type="text"
        placeholder="제목을 입력해주세요."
        className="post-create-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="tag-select-wrapper">
        {tagOptions.map((tag) => (
          <button
            key={tag}
            className={`tag-select-button ${
              tags.includes(tag) ? "selected" : ""
            }`}
            onClick={() => toggleTag(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="post-tags">
        {tags.map((tag, i) => (
          <span key={i} className="tag-item">
            #{tag}
          </span>
        ))}
      </div>

      {places.map((place, index) => (
        <div className="post-create-place-section" key={index}>
          <div className="post-create-place-title">
            <span className="post-create-step-number">{index + 1}</span>
            장소 이름을 입력해주세요.
          </div>

          <div className="post-create-upload-box">
            <div className="post-create-image-box">
              <label
                htmlFor={`imageUpload-${index}`}
                className="custom-file-upload"
              >
                이미지 업로드
              </label>
              <input
                id={`imageUpload-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                style={{ display: "none" }}
              />
              {place.image && (
                <img
                  src={place.image}
                  alt="미리보기"
                  className="preview-image"
                  style={{ width: "100px", marginTop: "8px" }}
                />
              )}
            </div>

            <textarea
              className="post-create-description-input"
              placeholder="설명을 작성해주세요."
              value={place.description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
            />
          </div>
        </div>
      ))}

      <button className="post-create-add-place-button" onClick={handleAddPlace}>
        + 장소 추가
      </button>

      <div className="post-create-bottom-buttons">
        <button className="post-create-draft-button" onClick={handleTempSave}>
          임시저장
        </button>
        <button className="post-create-submit-button" onClick={handleSubmit}>
          게시
        </button>
      </div>
    </div>
  );
};

export default PostCreatePage;

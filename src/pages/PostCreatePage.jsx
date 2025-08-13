import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCreatePage.css";
import baseApi from "../api/baseApi";
import Region from "../components/layout/Region";

const PostCreatePage = () => {
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [tags, setTags] = useState([]);
  const [places, setPlaces] = useState([
    { placeName: "", address: "", image: null, description: "" },
  ]);

  const navigate = useNavigate();

  const tagOptions = ["여행지", "맛집", "카페"];

  // 컴포넌트 마운트 시 임시저장된 데이터 불러오기
  useEffect(() => {
    const tempPost = localStorage.getItem("tempPost");
    if (tempPost) {
      const parsed = JSON.parse(tempPost);
      setTitle(parsed.title || "");
      setRegion(parsed.region || "");
      setTags(parsed.tags || []);
      setPlaces(
        parsed.places || [
          { placeName: "", address: "", image: null, description: "" },
        ]
      );
    }
  }, []);

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
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하만 업로드 가능합니다.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      const updated = [...places];
      updated[index].image = imageUrl;
      updated[index].imageFile = file; // 실제 파일도 저장
      setPlaces(updated);
    }
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...places];
    updated[index].description = value;
    setPlaces(updated);
  };

  const handlePlaceNameChange = (index, value) => {
    const updated = [...places];
    updated[index].placeName = value;
    setPlaces(updated);
  };

  const handleLocationClick = (index) => {
    // 실제로는 지도 API를 사용하여 위치를 선택하도록 구현
    // 현재는 임시로 mock 주소 사용
    const updated = [...places];
    updated[index].address = "서울 중구 세종대로21길 53";
    setPlaces(updated);
  };

  const handleAddPlace = () => {
    setPlaces([
      ...places,
      { placeName: "", address: "", image: null, description: "" },
    ]);
  };

  const handleRemovePlace = (index) => {
    if (places.length > 1) {
      const updated = places.filter((_, i) => i !== index);
      setPlaces(updated);
    }
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

  const validateForm = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return false;
    }
    if (!region) {
      alert("지역을 선택해주세요.");
      return false;
    }
    if (tags.length === 0) {
      alert("최소 하나의 태그를 선택해주세요.");
      return false;
    }
    if (places.some((place) => !place.placeName.trim())) {
      alert("모든 장소의 이름을 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const postData = {
      title,
      content: places.map((place) => place.description).join("\n\n"),
      region,
      tags,
      places: places.map((place, index) => ({
        placeOrder: index + 1,
        placeName: place.placeName,
        address: place.address,
        description: place.description,
      })),
    };

    try {
      const response = await baseApi.post("/articles", postData);

      // 이미지가 있는 경우 별도로 업로드
      for (let i = 0; i < places.length; i++) {
        if (places[i].imageFile) {
          const formData = new FormData();
          formData.append("image", places[i].imageFile);
          formData.append("placeIndex", i.toString());

          await baseApi.post(`/articles/${response.data.id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      // 임시저장 데이터 삭제
      localStorage.removeItem("tempPost");

      alert("게시글이 성공적으로 등록되었습니다!");
      navigate("/"); // 메인 페이지로 이동
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="post-create-container">
      <div className="post-create-header">
        <Region setRegion={setRegion} selectedRegion={region} />
      </div>

      <div className="post-create-content">
        <input
          type="text"
          placeholder="제목을 입력해주세요."
          className="post-create-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        <div className="tag-select-container">
          {tagOptions.map((tag) => (
            <button
              key={tag}
              className={`tag-select-chip ${
                tags.includes(tag) ? "selected" : ""
              }`}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>

        {places.map((place, index) => (
          <div className="place-section" key={index}>
            <div className="place-header">
              <div className="place-number">{index + 1}</div>
              <span className="place-title">장소 정보를 입력해주세요.</span>
              {places.length > 1 && (
                <button
                  className="place-remove-btn"
                  onClick={() => handleRemovePlace(index)}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="장소 이름"
              className="place-name-input"
              value={place.placeName}
              onChange={(e) => handlePlaceNameChange(index, e.target.value)}
              maxLength={50}
            />

            <button
              className="location-select-btn"
              onClick={() => handleLocationClick(index)}
              type="button"
            >
              위치 불러오기
            </button>

            {place.address && (
              <div className="selected-address">
                선택된 주소: {place.address}
              </div>
            )}

            <div className="image-upload-section">
              <label
                htmlFor={`imageUpload-${index}`}
                className="image-upload-label"
              >
                <div className="image-upload-placeholder">
                  {place.image ? (
                    <img
                      src={place.image}
                      alt="미리보기"
                      className="uploaded-image"
                    />
                  ) : (
                    <>
                      <div className="image-icon">📷</div>
                      <span>사진을 업로드해주세요.</span>
                    </>
                  )}
                </div>
              </label>
              <input
                id={`imageUpload-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                style={{ display: "none" }}
              />
            </div>

            <textarea
              className="place-description-input"
              placeholder="설명을 작성해주세요."
              value={place.description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              maxLength={500}
              rows={4}
            />
          </div>
        ))}

        <button
          className="add-place-btn"
          onClick={handleAddPlace}
          type="button"
        >
          + 장소 추가
        </button>
      </div>

      <div className="post-create-footer">
        <button
          className="temp-save-btn"
          onClick={handleTempSave}
          type="button"
        >
          임시저장
        </button>
        <button className="submit-btn" onClick={handleSubmit} type="button">
          게시
        </button>
      </div>
    </div>
  );
};

export default PostCreatePage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCreatePage.css";
import baseApi from "../api/baseApi";
import Region from "../components/layout/Region";

const PostCreatePage = () => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [tags, setTags] = useState([]);
  const [places, setPlaces] = useState([
    { placeName: "", address: null, image: null, description: "" },
  ]);

  const navigate = useNavigate();
  const tagOptions = ["여행지", "맛집", "카페"];

  useEffect(() => {
    const tempPost = localStorage.getItem("tempPost");
    if (tempPost) {
      const parsed = JSON.parse(tempPost);
      setTitle(parsed.title || "");
      setRegion(parsed.region || "");
      setTags(parsed.tags || []);
      setPlaces(
        parsed.places || [
          { placeName: "", address: null, image: null, description: "" },
        ]
      );
    }
  }, []);

  const toggleTag = (tag) => {
    setTags(
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하만 업로드 가능합니다.");
      return;
    }
    const updated = [...places];
    updated[index].image = URL.createObjectURL(file);
    updated[index].imageFile = file;
    setPlaces(updated);
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

  const handleLocationClick = async (index) => {
    try {
      setMessage("위치 가져오는 중…");

      const position = await new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("위치 기능을 지원하지 않아요."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      if (!window.kakao || !window.kakao.maps)
        throw new Error("지도 API 로딩 실패");
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 시/도 매핑
      const regionMap = {
        서울: "서울특별시",
        부산: "부산광역시",
        대구: "대구광역시",
        인천: "인천광역시",
        광주: "광주광역시",
        대전: "대전광역시",
        울산: "울산광역시",
        세종: "세종특별자치시",
        경기: "경기도",
        강원: "강원특별자치도",
        충북: "충청북도",
        충남: "충청남도",
        전북: "전북특별자치도",
        전남: "전라남도",
        경북: "경상북도",
        경남: "경상남도",
        제주: "제주특별자치도",
      };

      const roadAddressObj = await new Promise((resolve, reject) => {
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const rawAddress = result[0].road_address || result[0].address;

            const region1 =
              regionMap[rawAddress.region_1depth_name] ||
              rawAddress.region_1depth_name;
            const region2 = rawAddress.region_2depth_name;

            const addressObj = {
              address_name: rawAddress.address_name,
              region_1depth_name: region1, // 서울특별시 형태로 전달
              region_2depth_name: region2,
            };
            resolve(addressObj);
          } else {
            reject(new Error("주소 변환 실패"));
          }
        });
      });

      const updated = [...places];
      updated[index].address = roadAddressObj;
      setPlaces(updated);

      setMessage("위치 가져오기 완료!");
    } catch (e) {
      console.error(e);
      setMessage(e.message || "위치 가져오기 실패");
    }
  };

  const handleAddPlace = () => {
    setPlaces([
      ...places,
      { placeName: "", address: null, image: null, description: "" },
    ]);
  };

  const handleRemovePlace = (index) => {
    if (places.length > 1) setPlaces(places.filter((_, i) => i !== index));
  };

  const handleTempSave = () => {
    localStorage.setItem(
      "tempPost",
      JSON.stringify({ title, region, tags, places })
    );
    alert("임시 저장되었습니다!");
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return false;
    }
    if (tags.length === 0) {
      alert("최소 하나의 태그를 선택해주세요.");
      return false;
    }
    if (places.some((p) => !p.placeName.trim())) {
      alert("모든 장소의 이름을 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const postData = {
      title,
      content: places.map((p) => p.description).join("\n\n"),
      tags,
      places: places.map((p, i) => ({
        placeOrder: i + 1,
        placeName: p.placeName,
        description: p.description,
        photoUrl: p.image || null,
        roadAddress: p.address || null,
      })),
    };

    try {
      const response = await baseApi.post("/articles", postData);
      localStorage.removeItem("tempPost");
      alert("게시글이 성공적으로 등록되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="post-create-container">
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
                주소: {place.address.address_name} <br />
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

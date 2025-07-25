import React from "react";
import "./CertificationPage.css";

const CertificationPage = () => {
  return (
    <div className="certification-page">
      <h2>스탬프 받기</h2>
      <p>내 위치를 인증하고 스탬프를 받아요.</p>

      <div className="button-group">
        <button className="retry-btn">재시도</button>
        <button className="certify-btn">위치 인증하기</button>
      </div>

      <div className="location-status">
        <img src="/assests/location-pin.png" alt="pin" />
        <p>위치를 확인하는 중...</p>
      </div>
    </div>
  );
};

export default CertificationPage;

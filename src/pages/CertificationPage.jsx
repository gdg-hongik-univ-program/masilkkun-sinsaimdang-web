// src/pages/CertificationPage.jsx
import React, { useCallback, useState } from "react";
import "./CertificationPage.css";
import baseApi from "../api/baseApi";

const CertificationPage = () => {
  const [phase, setPhase] = useState("idle"); // idle | getting | sending | success | error
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy }
  const [message, setMessage] = useState(""); // 상태/에러 메시지
  const [result, setResult] = useState(null); // 백엔드 응답 (스탬프 정보 등)

  const getGeolocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("이 브라우저는 위치 기능을 지원하지 않아요."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          resolve({ lat: latitude, lng: longitude, accuracy });
        },
        (err) => {
          let msg = "위치를 가져오지 못했어요.";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg = "위치 권한이 거부되었어요. 브라우저 설정에서 허용해주세요.";
              break;
            case err.POSITION_UNAVAILABLE:
              msg = "위치 정보를 사용할 수 없어요.";
              break;
            case err.TIMEOUT:
              msg = "위치 요청이 시간 초과되었어요.";
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true, // 가능한 정확도 높임(배터리 소모 증가)
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const certify = useCallback(async () => {
    setPhase("getting");
    setMessage("내 위치를 확인하는 중…");
    setResult(null);

    try {
      // 1) GPS 좌표 가져오기
      const c = await getGeolocation();
      setCoords(c);

      // 2) 백엔드에 인증 요청 보내기
      setPhase("sending");
      setMessage("서버에 위치 인증 요청 중…");

      /**
       * 백엔드 예시 API (네 API 명세에 맞춰 경로/바디를 바꿔줘)
       * - 인증 기준: 서버가 현재 좌표가 특정 POI/폴리곤 반경 이내인지 판정
       * - 요청 바디는 lat/lng/accuracy와 선택적으로 장소/코스ID 등을 포함
       */
      const res = await baseApi.post("/certifications/verify-location", {
        latitude: c.lat,
        longitude: c.lng,
        accuracy: c.accuracy, // m 단위. 서버에서 임계값(예: <=50m) 판정에 사용 가능
        // articleId: <선택>, courseId: <선택>, userId는 토큰에서
      });

      // 성공 응답 예시 가정:
      // { data: { verified: true, stamp: { id, name, awardedAt } , reason?: string } }
      const data = res.data?.data ?? {};
      if (data.verified) {
        setPhase("success");
        setMessage("위치 인증 완료! 스탬프가 지급되었어요.");
        setResult(data);
      } else {
        setPhase("error");
        setMessage(
          data.reason || "인증 범위 밖이에요. 조금 더 가까이 이동해보세요."
        );
      }
    } catch (e) {
      setPhase("error");
      setMessage(e.message || "인증 과정에서 오류가 발생했어요.");
    }
  }, [getGeolocation]);

  const retry = () => {
    setPhase("idle");
    setMessage("");
    setResult(null);
  };

  return (
    <div className="certification-page">
      <h2>스탬프 받기</h2>
      <p>내 위치를 인증하고 스탬프를 받아요.</p>

      <div className="button-group">
        <button
          className="retry-btn"
          onClick={retry}
          disabled={phase === "getting" || phase === "sending"}
        >
          재시도
        </button>
        <button
          className="certify-btn"
          onClick={certify}
          disabled={phase === "getting" || phase === "sending"}
        >
          {phase === "getting"
            ? "위치 확인 중…"
            : phase === "sending"
            ? "인증 중…"
            : "위치 인증하기"}
        </button>
      </div>

      <div className="location-status">
        {/* 프로젝트 자산 경로에 맞게 수정 */}
        <img src="/src/assets/location-pin.png" alt="pin" />
        <p>{message || "버튼을 눌러 위치 인증을 시작하세요."}</p>

        {coords && (
          <div className="coords">
            <small>
              lat: {coords.lat.toFixed(6)}, lng: {coords.lng.toFixed(6)} (±
              {Math.round(coords.accuracy)}m)
            </small>
          </div>
        )}

        {phase === "success" && result?.stamp && (
          <div className="stamp-success">
            <strong>스탬프 지급 완료</strong>
            <div>이름: {result.stamp.name}</div>
            <div>
              지급 시각: {new Date(result.stamp.awardedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationPage;

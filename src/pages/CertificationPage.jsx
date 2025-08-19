import { useCallback, useState } from "react";
import "./CertificationPage.css";
import baseApi from "../api/baseApi";
import { useEffect } from "react";

const CertificationPage = () => {
  const [phase, setPhase] = useState("idle"); // idle | getting | sending | success | error
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy }
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  // 카카오 Geocoder 객체를 저장할 상태
  const [geocoder, setGeocoder] = useState(null);

  // 컴포넌트 마운트 시 카카오 Geocoder API 로드
  useEffect(() => {
    // 카카오맵 SDK가 로드된 경우
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        // Geocoder 객체는 services 라이브러리가 로드된 후에 사용 가능
        setGeocoder(new window.kakao.maps.services.Geocoder());
      });
    } else {
      // SDK가 로드되지 않았다면 동적으로 스크립트 로드
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_MAP_API
      }&libraries=services&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setGeocoder(new window.kakao.maps.services.Geocoder());
        });
      };
      document.head.appendChild(script);
    }
  }, []);

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

  // Geocoder API를 사용하여 좌표를 주소로 변환하는 함수
  const coordsToAddress = useCallback(
    (lat, lng) => {
      return new Promise((resolve, reject) => {
        if (!geocoder) {
          reject(new Error("Geocoder가 초기화되지 않았어요."));
          return;
        }
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const roadAddress = result[0].road_address;
            if (roadAddress) {
              // 🟢 축약 → 정식 명칭 매핑
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

              const region1 =
                regionMap[roadAddress.region_1depth_name] ||
                roadAddress.region_1depth_name;

              resolve({
                address_name: roadAddress.address_name,
                region_1depth_name: region1,
                region_2depth_name: roadAddress.region_2depth_name,
              });
            } else {
              reject(new Error("도로명 주소를 찾을 수 없어요."));
            }
          } else {
            reject(new Error("주소 변환에 실패했어요."));
          }
        });
      });
    },
    [geocoder]
  );

  const certify = useCallback(async () => {
    if (!geocoder) {
      setMessage("지도 서비스가 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setPhase("getting");
    setMessage("내 위치를 확인하고 주소로 변환 중…");
    setResult(null);

    try {
      // 1) GPS 좌표 가져오기
      const c = await getGeolocation();
      setCoords(c);

      // 2) GPS 좌표를 도로명 주소로 변환
      const roadAddress = await coordsToAddress(c.lat, c.lng);

      // 3) 백엔드에 인증 요청 보내기
      setPhase("sending");
      setMessage("서버에 위치 인증 요청 중…");

      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const res = await baseApi.post(
        "/location/verify",
        { road_address: roadAddress }, // 👈 백엔드가 요구하는 형식에 맞춰 데이터 전송
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data?.data ?? {};
      if (data.isVerified) {
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
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "인증 과정에서 오류가 발생했어요.";
      setMessage(errorMessage);
      console.error("인증 실패:", e);
    }
  }, [getGeolocation, coordsToAddress, geocoder]);

  const retry = () => {
    setPhase("idle");
    setMessage("");
    setResult(null);
  };

  return (
    <>
      {phase === "success" ? (
        // ✅ 성공 화면
        <div className="success-screen">
          <h2>🎉 인증 완료!</h2>
          <p>위치 인증이 성공적으로 완료되었어요.</p>

          <div className="stamp-box">
            <p>
              <strong>스탬프 1개</strong>가 지급되었습니다.
            </p>
          </div>

          <button className="retry-btn" onClick={retry}>
            다시 인증하기
          </button>
        </div>
      ) : (
        // ✅ 기본 화면
        <div className="certification-page">
          <h2>스탬프 받기</h2>
          <p>내 위치를 인증하고 스탬프를 받아요.</p>

          <div className="button-group">
            {phase === "error" && (
              <button className="retry-btn" onClick={retry}>
                다시 시도
              </button>
            )}
            <button
              className="certify-btn"
              onClick={certify}
              disabled={phase === "getting" || phase === "sending" || !geocoder}
            >
              {phase === "getting"
                ? "위치 확인 중…"
                : phase === "sending"
                ? "인증 중…"
                : !geocoder
                ? "서비스 로딩 중..."
                : "위치 인증하기"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificationPage;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Mapview = () => {
  const location = useLocation();
  const isPostPage = /^\/app\/post\/\d+$/.test(location.pathname);

  useEffect(() => {
    async function loadKakao() {
      if (!window.kakao) {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
          import.meta.env.VITE_MAP_API
        }&autoload=false`;
        document.head.appendChild(script);
        await new Promise((res) => {
          script.onload = res;
        });
      }

      window.kakao.maps.load(() => {
        const kakao = window.kakao;
        const map = new kakao.maps.Map(document.getElementById("map"), {
          center: new kakao.maps.LatLng(37.551, 126.926),
          level: 13,
        });

        const geocoder = new kakao.maps.services.Geocoder();

        kakao.maps.event.addListener(map, "click", function (mouseEvent) {
          geocoder.coord2Address(
            mouseEvent.latLng.getLng(),
            mouseEvent.latLng.getLat(),
            (result, status) => {
              if (status === kakao.maps.services.Status.OK && result[0]) {
                // 필요한 필드만 추출
                const roadAddress = result[0].road_address || {};
                const dataToSend = {
                  address_name: result[0].address.address_name || "",
                  road_address: {
                    address_name: roadAddress.address_name || "",
                    region_1depth_name: roadAddress.region_1depth_name || "",
                    region_2depth_name: roadAddress.region_2depth_name || "",
                    region_3depth_name: roadAddress.region_3depth_name || "",
                    road_name: roadAddress.road_name || "",
                    main_building_no: roadAddress.main_building_no || "",
                    building_name: roadAddress.building_name || "",
                    zone_no: roadAddress.zone_no || "",
                  },
                };

                // 예시: 서버로 POST 요청 보내기 (fetch 사용)
                fetch("/api/address", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dataToSend),
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("네트워크 에러");
                    return res.json();
                  })
                  .then((data) => {
                    console.log("서버 응답:", data);
                  })
                  .catch((err) => {
                    console.error("주소 전송 실패:", err);
                  });
              }
            }
          );
        });
      });
    }
    loadKakao();
  }, [location.pathname]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Mapview;

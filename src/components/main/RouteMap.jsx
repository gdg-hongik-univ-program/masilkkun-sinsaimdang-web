// src/components/RouteMap.jsx
import React, { useEffect, useRef } from "react";

const RouteMap = ({ start, end, waypoints = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_MAP_API
    }&libraries=services&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const { kakao } = window;
        const container = mapRef.current;
        const map = new kakao.maps.Map(container, {
          center: new kakao.maps.LatLng(start.lat, start.lng),
          level: 5,
        });

        // 마커 함수
        const addMarker = (position, title) =>
          new kakao.maps.Marker({ map, position, title });

        addMarker(new kakao.maps.LatLng(start.lat, start.lng), "출발");
        addMarker(new kakao.maps.LatLng(end.lat, end.lng), "도착");
        waypoints.forEach((p, i) =>
          addMarker(new kakao.maps.LatLng(p.lat, p.lng), `경유 ${i + 1}`)
        );

        // 경로 API 호출
        const wayStr = waypoints.map((p) => `${p.lng},${p.lat}`).join("|");
        const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}&waypoints=${wayStr}&priority=RECOMMEND&alternatives=false`;

        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader(
          "Authorization",
          `KakaoAK ${import.meta.env.VITE_MAP_API}`
        );

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (!data.routes?.length) return;

            const path = data.routes[0].sections[0].polyline;
            const linePath = path.map(
              ([lng, lat]) => new kakao.maps.LatLng(lat, lng)
            );

            // Polyline 그리기
            new kakao.maps.Polyline({
              map,
              path: linePath,
              strokeWeight: 5,
              strokeColor: "#FF0000",
              strokeOpacity: 0.7,
              strokeStyle: "solid",
            });

            // 지도 bounds 조정
            const bounds = new kakao.maps.LatLngBounds();
            linePath.forEach((latlng) => bounds.extend(latlng));
            map.setBounds(bounds);
          }
        };
        xhr.send();
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [start, end, waypoints]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};

export default RouteMap;

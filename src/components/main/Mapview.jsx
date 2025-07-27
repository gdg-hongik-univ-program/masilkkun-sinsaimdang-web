// Mapview.jsx
import React, { useEffect } from "react";
import "./Mapview.css";

const Mapview = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_MAP_API
    }&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(37.551, 126.926), // 홍대
          level: 13,
        };
        const map = new window.kakao.maps.Map(container, options);

        const markerPosition = [
          { lat: 37.551, lng: 126.926 },
          { lat: 37.566, lng: 126.978 },
        ];

        markerPosition.forEach((pos) => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
          });

          marker.setMap(map);
        });

        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(
          mapTypeControl,
          window.kakao.maps.ControlPosition.TOPRIGHT
        );

        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
      });
    };
    document.head.appendChild(script);
  }, []);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Mapview;

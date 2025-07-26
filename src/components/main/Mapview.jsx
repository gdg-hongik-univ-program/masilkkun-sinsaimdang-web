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
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 중심
          level: 3,
        };
        new window.kakao.maps.Map(container, options);
      });
    };
    document.head.appendChild(script);
  }, []);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Mapview;

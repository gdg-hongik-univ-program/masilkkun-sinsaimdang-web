import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Mapview.css";

const Mapview = () => {
  const location = useLocation();
  const isMyPage = location.pathname === "/mypage";
  const isPostPage = location.pathname.includes("/postlist");

  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // kakao SDK 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_MAP_API
    }&libraries=services,clusterer&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const kakao = window.kakao;
        const container = mapRef.current;

        const options = isPostPage
          ? {
              center: new kakao.maps.LatLng(37.2869619, 127.011801),
              level: 4,
              disableDoubleClickZoom: true,
              disableZoomAnimation: true,
            }
          : {
              center: new kakao.maps.LatLng(37.551, 126.926),
              level: 13,
              disableDoubleClickZoom: true,
              disableZoomAnimation: true,
            };

        const mapInstance = new kakao.maps.Map(container, options);

        // === Post 페이지: 마커 + 선 ===
        if (isPostPage) {
          const MARKER_WIDTH = 33,
            MARKER_HEIGHT = 36,
            OFFSET_X = 12,
            OFFSET_Y = MARKER_HEIGHT,
            OVER_MARKER_WIDTH = 40,
            OVER_MARKER_HEIGHT = 42,
            OVER_OFFSET_X = 13,
            OVER_OFFSET_Y = OVER_MARKER_HEIGHT,
            SPRITE_MARKER_URL = "/marker.png",
            SPRITE_WIDTH = 126,
            SPRITE_HEIGHT = 146,
            SPRITE_GAP = 10;

          const markerSize = new kakao.maps.Size(MARKER_WIDTH, MARKER_HEIGHT);
          const markerOffset = new kakao.maps.Point(OFFSET_X, OFFSET_Y);
          const overMarkerSize = new kakao.maps.Size(
            OVER_MARKER_WIDTH,
            OVER_MARKER_HEIGHT
          );
          const overMarkerOffset = new kakao.maps.Point(
            OVER_OFFSET_X,
            OVER_OFFSET_Y
          );
          const spriteImageSize = new kakao.maps.Size(
            SPRITE_WIDTH,
            SPRITE_HEIGHT
          );

          const positions = [
            new kakao.maps.LatLng(37.2869619, 127.011801),
            new kakao.maps.LatLng(37.2821351915, 127.0190947768),
            new kakao.maps.LatLng(37.2884234215, 127.0229636943),
          ];

          let selectedMarker = null;
          const createMarkerImage = (size, offset, origin) =>
            new kakao.maps.MarkerImage(SPRITE_MARKER_URL, size, {
              offset,
              spriteOrigin: origin,
              spriteSize: spriteImageSize,
            });

          positions.forEach((position, index) => {
            const gapX = MARKER_WIDTH + SPRITE_GAP;
            const originY = (MARKER_HEIGHT + SPRITE_GAP) * index;
            const overOriginY = (OVER_MARKER_HEIGHT + SPRITE_GAP) * index;

            const normalImage = createMarkerImage(
              markerSize,
              markerOffset,
              new kakao.maps.Point(0, originY)
            );
            const clickImage = createMarkerImage(
              markerSize,
              markerOffset,
              new kakao.maps.Point(gapX, originY)
            );
            const overImage = createMarkerImage(
              overMarkerSize,
              overMarkerOffset,
              new kakao.maps.Point(gapX * 2, overOriginY)
            );

            const marker = new kakao.maps.Marker({
              map: mapInstance,
              position,
              image: normalImage,
            });
            marker.normalImage = normalImage;

            kakao.maps.event.addListener(marker, "mouseover", () => {
              if (!selectedMarker || selectedMarker !== marker)
                marker.setImage(overImage);
            });
            kakao.maps.event.addListener(marker, "mouseout", () => {
              if (!selectedMarker || selectedMarker !== marker)
                marker.setImage(normalImage);
            });
            kakao.maps.event.addListener(marker, "click", () => {
              if (!selectedMarker || selectedMarker !== marker) {
                if (selectedMarker)
                  selectedMarker.setImage(selectedMarker.normalImage);
                marker.setImage(clickImage);
              }
              selectedMarker = marker;
            });
          });

          const polyline = new kakao.maps.Polyline({
            path: positions,
            strokeWeight: 4,
            strokeColor: "#ff0000ff",
            strokeOpacity: 1,
            strokeStyle: "solid",
          });
          polyline.setMap(mapInstance);
        }

        // === 마이페이지: 폴리곤 ===
        if (isMyPage) {
          let polygons = [];
          let isSelected = false;
          const clearPolygons = () => {
            polygons.forEach((poly) => poly.setMap(null));
            polygons = [];
          };

          const loadGeoJson = async (path) => {
            const res = await fetch(path);
            const geojson = await res.json();
            geojson.features.forEach((unit) => {
              const coords = unit.geometry.coordinates[0];
              const path = coords.map(
                (coord) => new kakao.maps.LatLng(coord[1], coord[0])
              );
              const polygon = new kakao.maps.Polygon({
                map: mapInstance,
                path,
                strokeWeight: 2,
                strokeColor: "#004c80",
                strokeOpacity: 0.8,
                fillColor: "#fff",
                fillOpacity: 0.7,
              });
              kakao.maps.event.addListener(polygon, "click", () => {
                isSelected = !isSelected;
                polygon.setOptions({
                  fillColor: isSelected ? "#FF6347" : "#fff",
                  fillOpacity: 0.7,
                });
              });
              polygons.push(polygon);
            });
          };

          // 초기 시/도 로드
          loadGeoJson("/json/sido.json");

          // 확대/축소 시 폴리곤 변경
          kakao.maps.event.addListener(mapInstance, "zoom_changed", () => {
            const level = mapInstance.getLevel();
            clearPolygons();
            if (level <= 10) loadGeoJson("/json/sig.json");
            else loadGeoJson("/json/sido.json");
          });
        }

        // === 지도 UI 컨트롤 ===
        const mapTypeControl = new kakao.maps.MapTypeControl();
        mapInstance.addControl(
          mapTypeControl,
          kakao.maps.ControlPosition.TOPRIGHT
        );

        const zoomControl = new kakao.maps.ZoomControl();
        mapInstance.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
      });
    };
    document.head.appendChild(script);
  }, [location.pathname]);

  return (
    <div id="map" ref={mapRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default Mapview;

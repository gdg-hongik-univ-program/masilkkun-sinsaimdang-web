import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Mapview = () => {
  const location = useLocation();
  const isPostPage = /^\/app\/post\/\d+$/.test(location.pathname);
  // const isMyPage = ... // isMyPage 변수 선언 안 보임. 필요하면 추가하세요.

  useEffect(() => {
    function loadKakaoScript() {
      return new Promise((resolve) => {
        if (document.getElementById("kakao-map-script")) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.id = "kakao-map-script";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
          import.meta.env.VITE_MAP_API
        }&autoload=false`;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    async function initializeMap() {
      await loadKakaoScript();

      window.kakao.maps.load(() => {
        const kakao = window.kakao;

        const container = document.getElementById("map");
        const options = isPostPage
          ? {
              center: new kakao.maps.LatLng(37.27638, 127.051105),
              level: 6,
              disableDoubleClickZoom: true,
              disableZoomAnimation: true,
            }
          : {
              center: new kakao.maps.LatLng(37.551, 126.926),
              level: 13,
              disableDoubleClickZoom: true,
              disableZoomAnimation: true,
            };
        const map = new kakao.maps.Map(container, options);

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
          new kakao.maps.LatLng(37.27638, 127.051105),
          new kakao.maps.LatLng(37.286066, 127.011681),
          new kakao.maps.LatLng(37.300044, 127.000581),
        ];

        let selectedMarker = null;

        function createMarkerImage(markerSize, offset, spriteOrigin) {
          return new kakao.maps.MarkerImage(SPRITE_MARKER_URL, markerSize, {
            offset,
            spriteOrigin,
            spriteSize: spriteImageSize,
          });
        }

        if (isPostPage) {
          positions.forEach((position, index) => {
            const gapX = MARKER_WIDTH + SPRITE_GAP;
            const originY = (MARKER_HEIGHT + SPRITE_GAP) * index;
            const overOriginY = (OVER_MARKER_HEIGHT + SPRITE_GAP) * index;

            const normalOrigin = new kakao.maps.Point(0, originY);
            const clickOrigin = new kakao.maps.Point(gapX, originY);
            const overOrigin = new kakao.maps.Point(gapX * 2, overOriginY);

            const normalImage = createMarkerImage(
              markerSize,
              markerOffset,
              normalOrigin
            );
            const overImage = createMarkerImage(
              overMarkerSize,
              overMarkerOffset,
              overOrigin
            );
            const clickImage = createMarkerImage(
              markerSize,
              markerOffset,
              clickOrigin
            );

            const marker = new kakao.maps.Marker({
              map,
              position,
              image: normalImage,
            });

            marker.normalImage = normalImage;

            kakao.maps.event.addListener(marker, "click", () => {
              if (!selectedMarker || selectedMarker !== marker) {
                if (selectedMarker) {
                  selectedMarker.setImage(selectedMarker.normalImage);
                }
                marker.setImage(clickImage);
                selectedMarker = marker;
              }

              // overlay가 선언되어 있지 않은데, 혹시 따로 구현한 게 있나요?
              // overlay.setMap(map); // 이 부분은 필요에 따라 처리하세요.
            });

            kakao.maps.event.addListener(marker, "mouseover", () => {
              if (!selectedMarker || selectedMarker !== marker) {
                marker.setImage(overImage);
              }
            });

            kakao.maps.event.addListener(marker, "mouseout", () => {
              if (!selectedMarker || selectedMarker !== marker) {
                marker.setImage(normalImage);
              }
            });

            kakao.maps.event.addListener(marker, "click", () => {
              if (!selectedMarker || selectedMarker !== marker) {
                if (selectedMarker) {
                  selectedMarker.setImage(selectedMarker.normalImage);
                }
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
          polyline.setMap(map);
        }

        // 폴리곤 부분 !
        let detailMode = false;
        let polygons = [];
        let areas = [];

        // isMyPage 변수가 없으므로, 아래는 필요하면 선언 및 조건 추가하세요.
        // if (isMyPage) {
        //   loadGeoJson("/json/sido.json");
        // }

        kakao.maps.event.addListener(map, "zoom_changed", () => {
          const level = map.getLevel();
          if (!detailMode && level <= 10) {
            detailMode = true;
            clearPolygons();
            loadGeoJson("/json/sig.json");
          } else if (detailMode && level > 10) {
            detailMode = false;
            clearPolygons();
            loadGeoJson("/json/sido.json");
          } else {
            clearPolygons();
          }
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

                // 아래 features 변수가 정의되어 있지 않음. 필요하면 선언 및 값 할당하세요.
                // 예: const features = ...;

                areas = features.map((unit) => {
                  const coords = unit.geometry.coordinates[0];
                  const name = unit.properties.SIG_KOR_NM;
                  const code = unit.properties.SIG_CD;

                  const path = coords.map(
                    (coord) => new kakao.maps.LatLng(coord[1], coord[0])
                  );
                  return { name, location: code, path };
                });

                areas.forEach(drawPolygon);
              }
            }
          );
        });

        function drawPolygon(area) {
          const polygon = new kakao.maps.Polygon({
            map,
            path: area.path,
            strokeWeight: 2,
            strokeColor: "#004c80",
            strokeOpacity: 0.8,
            fillColor: "#fff",
            fillOpacity: 0.7,
          });

          polygons.push(polygon);

          let isSelected = false;

          kakao.maps.event.addListener(polygon, "click", () => {
            isSelected = !isSelected;
            polygon.setOptions({
              fillColor: isSelected ? "#FF6347" : "#fff",
              fillOpacity: 0.7,
            });
          });
        }

        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 필요시 clearPolygons, loadGeoJson 함수 정의도 추가하세요.
      });
    }

    initializeMap();
  }, [location.pathname]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Mapview;

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useLocation } from "react-router-dom";
import "./Mapview.css";

const Mapview = forwardRef(({ onSelectPlace }, ref) => {
  const location = useLocation();
  const isMyPage = location.pathname === "/mypage";
  const isPostPage = location.pathname.includes("/create");

  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const psRef = useRef(null);
  const infowindowRef = useRef(null);
  const keywordRef = useRef(null);
  const listRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [onSelectPlaceCallback, setOnSelectPlaceCallback] = useState(null);

  // 부모 컴포넌트에서 호출 가능
  useImperativeHandle(ref, () => ({
    openSearch: () => setShowSearch(true),
    closeSearch: () => setShowSearch(false),
    setOnSelectPlace: (callback) => setOnSelectPlaceCallback(() => callback),
  }));

  const handlePlaceClick = (place) => {
    if (onSelectPlaceCallback) onSelectPlaceCallback(place);
    setShowSearch(false);
  };

  const removeMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const searchPlaces = (keyword) => {
    if (!keyword?.trim() || !psRef.current || !mapInstanceRef.current) return;

    psRef.current.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        removeMarkers();
        const bounds = new window.kakao.maps.LatLngBounds();
        const listEl = listRef.current;
        if (listEl) listEl.innerHTML = "";

        data.forEach((place, i) => {
          const position = new window.kakao.maps.LatLng(place.y, place.x);

          const imageSrc = "/marker2.png";
          const imageSize = new window.kakao.maps.Size(36, 37);
          const imgOptions = {
            spriteSize: new window.kakao.maps.Size(36, 691),
            spriteOrigin: new window.kakao.maps.Point(0, i * 46 + 10),
            offset: new window.kakao.maps.Point(13, 37),
          };
          const markerImage = new window.kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imgOptions
          );

          const marker = new window.kakao.maps.Marker({
            map: mapInstanceRef.current,
            position,
            image: markerImage,
          });
          markersRef.current.push(marker);

          window.kakao.maps.event.addListener(marker, "click", () => {
            mapInstanceRef.current.setLevel(3, { animate: true });
            infowindowRef.current.setContent(`<div>${place.place_name}</div>`);
            infowindowRef.current.open(mapInstanceRef.current, marker);
          });

          window.kakao.maps.event.addListener(marker, "mouseover", () => {
            infowindowRef.current.setContent(
              `<div style="padding:5px;font-size:13px;">${place.place_name}</div>`
            );
            infowindowRef.current.open(mapInstanceRef.current, marker);
          });

          window.kakao.maps.event.addListener(marker, "mouseout", () =>
            infowindowRef.current.close()
          );

          if (listEl) {
            const li = document.createElement("li");
            li.className = "item";
            li.innerHTML = `
              <span class="markerbg marker_${i + 1}"></span>
              <div class="info">
                <h5>${place.place_name}</h5>
                ${place.road_address_name || place.address_name}
              </div>
            `;
            li.style.cursor = "pointer";
            li.onmouseover = () => {
              infowindowRef.current.setContent(
                `<div style="padding:5px;font-size:13px;">${place.place_name}</div>`
              );
              infowindowRef.current.open(mapInstanceRef.current, marker);
            };
            li.onmouseout = () => infowindowRef.current.close();
            li.onclick = () => {
              mapInstanceRef.current.setLevel(3, { animate: true });
              mapInstanceRef.current.panTo(position);
              handlePlaceClick({
                placeName: place.place_name,
                address: place.road_address_name || place.address_name,
              });
            };
            listEl.appendChild(li);
          }

          bounds.extend(position);
        });

        if (data.length > 0) {
          const firstPlace = data[0];
          const firstPosition = new window.kakao.maps.LatLng(
            firstPlace.y,
            firstPlace.x
          );
          mapInstanceRef.current.setLevel(3, { animate: true });
          mapInstanceRef.current.panTo(firstPosition);
        }
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 없습니다.");
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  // 지도 초기화 + 폴리곤 복원
  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_MAP_API
    }&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const kakao = window.kakao;
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.566826, 126.9786567),
          level: isMyPage ? 13 : 3,
        });
        mapInstanceRef.current = map;
        psRef.current = new kakao.maps.services.Places();
        infowindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });

        // 폴리곤 로딩
        let detailMode = false;
        let polygons = [];
        let areas = [];

        function clearPolygons() {
          polygons.forEach((poly) => poly.setMap(null));
          polygons = [];
          areas = [];
        }

        async function loadGeoJson(path) {
          const res = await fetch(path);
          const geojson = await res.json();
          const features = geojson.features;

          areas = features.map((unit) => {
            const coords = unit.geometry.coordinates[0];
            const name = unit.properties.SIG_KOR_NM;
            const code = unit.properties.SIG_CD;
            let paths = [];

            if (unit.geometry.type === "Polygon") {
              paths = unit.geometry.coordinates.map((ring) =>
                ring.map((coord) => new kakao.maps.LatLng(coord[1], coord[0]))
              );
            }
            // MultiPolygon: [ [ [ [lng, lat], ... ] ], [ [lng, lat], ... ] ]
            else if (unit.geometry.type === "MultiPolygon") {
              unit.geometry.coordinates.forEach((polygon) => {
                polygon.forEach((ring) => {
                  paths.push(
                    ring.map(
                      (coord) => new kakao.maps.LatLng(coord[1], coord[0])
                    )
                  );
                });
              });
            }

            return { name, location: code, paths };
          });
          areas.forEach(drawPolygon);
        }

        function drawPolygon(area) {
          const polygon = new kakao.maps.Polygon({
            map,
            path: area.paths,
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

        if (isMyPage) {
          loadGeoJson("/json/sido.json");

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
            }
          });
        }

        // 컨트롤 UI
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
      });
    };
    document.head.appendChild(script);
  }, [location.pathname]);

  return (
    <div className="map_wrap">
      {isPostPage && showSearch && (
        <div id="menu_wrap" className="bg_white">
          <form id="searchForm" onSubmit={(e) => e.preventDefault()}>
            키워드: <input type="text" ref={keywordRef} size="15" />
            <button
              type="button"
              onClick={() => searchPlaces(keywordRef.current.value)}
            >
              검색
            </button>
          </form>
          <ul ref={listRef} id="placesList"></ul>
        </div>
      )}
      <div
        id="map"
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </div>
  );
});

export default Mapview;

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useLocation } from "react-router-dom";
import "./Mapview.css";

export let mapInstanceRefGlobal = null;

// Mapview 외부에서 호출할 수 있는 초기 지도 생성
export const initMapRoute = () => {
  if (!window.kakao) return;
  const container = document.createElement("div");
  container.style.width = "0px";
  container.style.height = "0px";
  document.body.appendChild(container);

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3,
  });

  mapInstanceRefGlobal = map;
};

// Mapview 외부에서 길찾기 호출
export const getRoute = async (routePlaces) => {
  if (!routePlaces?.length || !window.kakao || !mapInstanceRefGlobal) return;

  const start = routePlaces[0];
  const end = routePlaces[routePlaces.length - 1];
  const waypoints = routePlaces
    .slice(1, -1)
    .map((p) => `${p.lng},${p.lat}`)
    .join("|");

  const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}&waypoints=${waypoints}&priority=RECOMMEND&alternatives=false`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader(
      "Authorization",
      `KakaoAK ${import.meta.env.VITE_REST_API}`
    );
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else reject(xhr.status);
      }
    };
    xhr.send();
  });
};

const Mapview = forwardRef(({ onSelectPlace }, ref) => {
  const routeMarkersRef = useRef([]);
  const location = useLocation();
  const isMyPage = location.pathname === "/mypage";
  const isCreatePage = location.pathname.includes("/create");

  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const psRef = useRef(null);
  const infowindowRef = useRef(null);
  const keywordRef = useRef(null);
  const listRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [onSelectPlaceCallback, setOnSelectPlaceCallback] = useState(null);

  const waitForMap = () =>
    new Promise((resolve) => {
      const check = () => {
        if (mapInstanceRef.current) resolve();
        else setTimeout(check, 50);
      };
      check();
    });

  useImperativeHandle(ref, () => ({
    openSearch: () => setShowSearch(true),
    closeSearch: () => setShowSearch(false),
    setOnSelectPlace: (callback) => setOnSelectPlaceCallback(() => callback),
    getRoute: async (routePlaces) => {
      await waitForMap();
      if (!routePlaces?.length || !window.kakao || !mapInstanceRef.current)
        return;

      // 기존 경로/마커 정리
      if (mapInstanceRef.current.polyline) {
        mapInstanceRef.current.polyline.setMap(null);
        mapInstanceRef.current.polyline = null;
      }
      routeMarkersRef.current.forEach((m) => m.setMap(null));
      routeMarkersRef.current = [];

      // 시작점 기준 센터 이동
      const first = routePlaces[0];
      mapInstanceRef.current.panTo(
        new window.kakao.maps.LatLng(first.lat, first.lng)
      );

      // 요청 URL 구성
      const start = routePlaces[0];
      const end = routePlaces[routePlaces.length - 1];
      const waypointsStr = routePlaces
        .slice(1, -1)
        .map((p) => `${p.lng},${p.lat}`)
        .join("|");

      let url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}&priority=RECOMMEND&alternatives=false`;
      if (waypointsStr) url += `&waypoints=${encodeURIComponent(waypointsStr)}`;

      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader(
        "Authorization",
        `KakaoAK ${import.meta.env.VITE_REST_API}`
      );
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) return;

        const data = JSON.parse(xhr.responseText);
        const route = data?.routes?.[0];
        if (!route) return;

        // 🔥 자세한 경로: roads[].vertexes를 전부 이어 붙이기
        const path = [];
        (route.sections || []).forEach((section) => {
          (section.roads || []).forEach((road) => {
            const v = road.vertexes || [];
            for (let i = 0; i < v.length; i += 2) {
              const x = v[i],
                y = v[i + 1];
              path.push(new window.kakao.maps.LatLng(y, x));
            }
          });
        });

        // roads가 비어있으면 guides로 폴백
        if (!path.length) {
          (route.sections?.[0]?.guides || []).forEach((g) => {
            path.push(new window.kakao.maps.LatLng(g.y, g.x));
          });
        }
        if (!path.length) return;

        // 폴리라인 그리기
        const polyline = new window.kakao.maps.Polyline({
          map: mapInstanceRef.current,
          path,
          strokeWeight: 6,
          strokeColor: "#ff3b30",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
        mapInstanceRef.current.polyline = polyline;

        // 지도 범위
        const bounds = new window.kakao.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));

        // ✅ 사용자 제공 장소만 마커 생성
        routeMarkersRef.current = routePlaces.map((place, idx) => {
          const pos = new window.kakao.maps.LatLng(place.lat, place.lng);
          const imageSrc = "/marker2.png"; // public/marker2.png 에 위치해야 함
          const imageSize = new window.kakao.maps.Size(36, 37);
          const imgOptions = {
            spriteSize: new window.kakao.maps.Size(36, 691),
            spriteOrigin: new window.kakao.maps.Point(0, idx * 46 + 10), // idx에 따라 다른 부분 보여주기
            offset: new window.kakao.maps.Point(13, 37),
          };
          const markerImage = new window.kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imgOptions
          );
          const marker = new window.kakao.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            image: markerImage,
            title: place.placeName || place.name || `장소 ${idx + 1}`,
          });

          const label =
            idx === 0
              ? "출발"
              : idx === routePlaces.length - 1
              ? "도착"
              : `${idx + 1}`;
          const info = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 8px;font-size:12px;">
                      <b>${label}</b> ${place.placeName || ""}<br/>
                      ${place.address || ""}
                    </div>`,
          });
          window.kakao.maps.event.addListener(marker, "click", () => {
            info.open(mapInstanceRef.current, marker);
          });

          bounds.extend(pos);
          return marker;
        });

        mapInstanceRef.current.setBounds(bounds);
      };
      xhr.send();
    },
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
      }
    });
  };

  // 지도 초기화 + 폴리곤
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
            const path = coords.map(
              (coord) => new kakao.maps.LatLng(coord[1], coord[0])
            );
            return { name, location: code, path };
          });

          areas.forEach(drawPolygon);
        }

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

        if (isMyPage) {
          loadGeoJson("/json/sido.json");

          kakao.maps.event.addListener(map, "zoom_changed", () => {
            const level = map.get2Level();
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
      {isCreatePage && showSearch && (
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

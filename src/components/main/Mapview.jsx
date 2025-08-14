import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Mapview.css";

const Mapview = () => {
  const location = useLocation();
  const isPostPage = /^\/app\/post\/\d+$/.test(location.pathname);
  const isWritePage = location.pathname === "/app/post/new";
  const [map, setMap] = useState(null);
  const keywordRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const loadKakaoScript = () => {
      return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.id = "kakao-map-script";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
          import.meta.env.VITE_MAP_API
        }&libraries=services,clusterer&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      await loadKakaoScript();

      const kakao = window.kakao;
      const container = mapContainerRef.current;
      if (!container) return;

      const options = isWritePage
        ? { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 3 }
        : isPostPage
        ? { center: new kakao.maps.LatLng(37.27638, 127.051105), level: 6 }
        : { center: new kakao.maps.LatLng(37.551, 126.926), level: 13 };

      const newMap = new kakao.maps.Map(container, options);
      setMap(newMap);

      let markers = [];
      let infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

      const removeMarker = () => {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];
      };

      const displayInfowindow = (marker, title) => {
        const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
        infowindow.setContent(content);
        infowindow.open(newMap, marker);
      };

      const getListItem = (index, place) => {
        const el = document.createElement("li");
        el.className = "item";
        const itemStr = `
          <span class="markerbg marker_${index + 1}"></span>
          <div class="info">
            <h5>${place.place_name}</h5>
            ${
              place.road_address_name
                ? `<span>${place.road_address_name}</span>
               <span class="jibun gray">${place.address_name}</span>`
                : `<span>${place.address_name}</span>`
            }
            <span class="tel">${place.phone}</span>
          </div>
        `;
        el.innerHTML = itemStr;
        return el;
      };

      const addMarker = (position, idx) => {
        const imageSrc =
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png",
          imageSize = new kakao.maps.Size(36, 37),
          imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691),
            spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10),
            offset: new kakao.maps.Point(13, 37),
          },
          markerImage = new kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imgOptions
          ),
          marker = new kakao.maps.Marker({
            position,
            image: markerImage,
          });
        marker.setMap(newMap);
        markers.push(marker);
        return marker;
      };

      if (isWritePage) {
        const ps = new kakao.maps.services.Places();

        const searchPlaces = () => {
          const keyword = keywordRef.current.value;
          if (!keyword.trim()) {
            alert("키워드를 입력해주세요!");
            return false;
          }
          ps.keywordSearch(keyword, placesSearchCB);
        };
        window.searchPlaces = searchPlaces;

        const placesSearchCB = (data, status, pagination) => {
          if (status === kakao.maps.services.Status.OK) {
            displayPlaces(data, pagination);
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert("검색 결과가 존재하지 않습니다.");
          } else if (status === kakao.maps.services.Status.ERROR) {
            alert("검색 결과 중 오류가 발생했습니다.");
          }
        };

        const displayPlaces = (places, pagination) => {
          const listEl = document.getElementById("placesList");
          const paginationEl = document.getElementById("pagination");
          const bounds = new kakao.maps.LatLngBounds();

          if (listEl) {
            while (listEl.hasChildNodes()) {
              listEl.removeChild(listEl.lastChild);
            }
          }
          removeMarker();

          for (let i = 0; i < places.length; i++) {
            const placePosition = new kakao.maps.LatLng(
              places[i].y,
              places[i].x
            );
            const marker = addMarker(placePosition, i);
            const itemEl = getListItem(i, places[i]);

            bounds.extend(placePosition);

            ((marker, title) => {
              kakao.maps.event.addListener(marker, "mouseover", () =>
                displayInfowindow(marker, title)
              );
              kakao.maps.event.addListener(marker, "mouseout", () =>
                infowindow.close()
              );
              itemEl.onmouseover = () => displayInfowindow(marker, title);
              itemEl.onmouseout = () => infowindow.close();
            })(marker, places[i].place_name);

            if (listEl) listEl.appendChild(itemEl);
          }
          newMap.setBounds(bounds);
          displayPagination(pagination);
        };

        const displayPagination = (pagination) => {
          const paginationEl = document.getElementById("pagination");
          if (paginationEl) {
            while (paginationEl.hasChildNodes()) {
              paginationEl.removeChild(paginationEl.lastChild);
            }
            for (let i = 1; i <= pagination.last; i++) {
              const el = document.createElement("a");
              el.href = "#";
              el.innerHTML = i;
              if (i === pagination.current) {
                el.className = "on";
              } else {
                el.onclick = (function (i) {
                  return function () {
                    pagination.gotoPage(i);
                  };
                })(i);
              }
              paginationEl.appendChild(el);
            }
          }
        };
      } else {
        // 기존 코드 유지 (게시글 보기 페이지, 마이페이지 등)
        const mapTypeControl = new kakao.maps.MapTypeControl();
        newMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

        const zoomControl = new kakao.maps.ZoomControl();
        newMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // ... (마커, 폴리라인, 폴리곤 로직은 여기에 그대로)
      }
    };

    initializeMap();

    return () => {
      if (window.searchPlaces) {
        delete window.searchPlaces;
      }
      if (map) {
        // 지도 객체 제거 로직 (필요 시)
      }
    };
  }, [location.pathname]);

  return (
    <div className="map_wrap">
      {isWritePage && (
        <div id="menu_wrap" className="bg_white">
          <div className="option">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.searchPlaces();
              }}
            >
              키워드 :{" "}
              <input type="text" id="keyword" ref={keywordRef} size="15" />
              <button type="submit">검색하기</button>
            </form>
          </div>
          <hr />
          <ul id="placesList"></ul>
          <div id="pagination"></div>
        </div>
      )}
      <div
        id="map"
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </div>
  );
};

export default Mapview;

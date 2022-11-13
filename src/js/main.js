const dataPerPage = 10;
const pageCount = 5;
let currentPage = 1;
let totalPage = 0;

const restaurantData = [];
let markers = [];
let infoWindows = [];

const googleMap = initMap();
init();

// 초기화
function init() {
    requestData();
}

// 구글맵 생성
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {lat: 33.3616658, lng: 126.5204118},
    });
    return map;
}

// 오름 API 요청
async function requestData(page = 1) {
    const options = {
        page,
        perPage: dataPerPage,
        key: 'XXqQ%2BC3B7%2FwqSQWPoNnpzObB6WexRJXlt%2B0qbfzV%2BnJqVUDeFdVf6v8GW8UYDuu14la6Bxj8O3UpNMs6TfeC4w%3D%3D',
    };
    const response = await fetch(`https://api.odcloud.kr/api/15096996/v1/uddi:6738a90c-ec96-4245-a187-9528cea62904?page=${options.page}&perPage=${options.perPage}&serviceKey=${options.key}`);
    const json = await response.json();

    totalPage = json.totalCount;

    for (const data of json.data) {
        restaurantData.push(data);
        addMarker(googleMap, data);
    }

    showMarkers(googleMap);

    console.log(restaurantData);
}

// 마커 생성
function addMarker(map, {오름명, 설명, 위도, 경도}) {
    const position = new google.maps.LatLng(위도, 경도);

    const marker = new google.maps.Marker({
        position,
        animation: google.maps.Animation.DROP,
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="iw-inner">
                <strong class="iw-title">${오름명}</strong>
                <p class="iw-desc">${설명}</p>
            </div>
        `,
        ariaLabel: 오름명,
    });

    marker.addListener('click', () => {
        infoWindows.forEach(infoWindow => infoWindow.close());
        infoWindow.open({
            map,
            anchor: marker,
        });
    });

    markers.push(marker);
    infoWindows.push(infoWindow);
}

// 마커를 지도에 표시
function showMarkers(map, index) {
    const bounds = new google.maps.LatLngBounds();

    if (index !== undefined) {
        markers[index].setMap(map);
        bounds.extend(markers[index].position);
    } else {
        markers.slice(index).forEach(marker => {
            marker.setMap(map);
            bounds.extend(marker.position);
        });
    }

    map.fitBounds(bounds);
    map.panToBounds(bounds);
}

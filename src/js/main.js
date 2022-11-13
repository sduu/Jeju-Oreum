const $oreumList = document.querySelector('.oreum-list');
const $pagination = document.querySelector('.oreum-pagination');
const $numList = $pagination.querySelector('.num-list');
const $btnPrev = $pagination.querySelector('.btn-prev');
const $btnNext = $pagination.querySelector('.btn-next');

const dataPerPage = 10;
const pageCount = 5;
let currentPage = 1;
let totalPage = 0;

let oreumData = [];
let markers = [];
let infoWindows = [];

// 초기화
const googleMap = initMap();
await requestData();
createListItem();
createPagination();
bindEvent();

// 이벤트 바인딩
function bindEvent() {
    $btnPrev.addEventListener('click', handlerPageBtnClick);
    $btnNext.addEventListener('click', handlerPageBtnClick);
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
        oreumData.push(data);
        addMarker(googleMap, data);
    }

    showMarkers(googleMap);
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

// 마커 지도에 표시
function showMarkers(map, index) {
    if (index !== undefined) {
        // 한 개의 마커 표시
        markers[index].setMap(map);
        map.panTo(markers[index].position);
        map.setZoom(15);
    } else {
        // 여러개 마커 표시
        const bounds = new google.maps.LatLngBounds();
        markers.slice(index).forEach(marker => {
            marker.setMap(map);
            bounds.extend(marker.position);
        });
        map.panToBounds(bounds);
        map.fitBounds(bounds);
    }
}

// 마커 지도에서 숨기기
function hideMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
}

// 마커 삭제
function deleteMarker() {
    hideMarkers();
    markers = [];
    infoWindows = [];
}

// 리스트 아이템 요소 생성
function createListItem() {
    const $fragment = document.createDocumentFragment();

    oreumData.forEach(({위치, 오름명}, i) => {
        const $item = document.createElement('li');
        const $button = document.createElement('button');
        const innerContent = `
            <span>${위치.split(' ')[0]}</span>
            <strong>${오름명}</strong>
            <p>${위치}</p>
        `;

        $item.classList.add('oreum-item');
        $button.type = 'button';
        $button.innerHTML = innerContent;

        $item.appendChild($button);
        $fragment.appendChild($item);

        $button.addEventListener('click', () => handlerListItemClick(i));
    });

    $oreumList.appendChild($fragment);
}

// 리스트 아이템 요소 클릭 핸들러
function handlerListItemClick(index) {
    const $btns = $oreumList.querySelectorAll('.oreum-item button');
    [...$btns].forEach(btn => btn.classList.remove('is-active'));
    event.currentTarget.classList.add('is-active');

    hideMarkers();
    showMarkers(googleMap, index);
}

// 페이징 요소 생성
function createPagination(pageGroup = 1) {
    const $fragment = document.createDocumentFragment();
    const start = pageGroup * pageCount - (pageCount - 1);
    const end = pageGroup * pageCount > Math.ceil(totalPage / dataPerPage) ? Math.ceil(totalPage / dataPerPage) : pageGroup * pageCount;

    for (let i = start; i <= end; i++) {
        const $button = document.createElement('button');
        $button.type = 'button';
        $button.textContent = i;

        if (i === currentPage) $button.classList.add('is-active');

        $button.addEventListener('click', () => handlerPageNumClick(i));

        $fragment.appendChild($button);
    }

    $numList.appendChild($fragment);

    start === 1 ? ($btnPrev.disabled = true) : ($btnPrev.disabled = false);
    end >= Math.ceil(totalPage / dataPerPage) ? ($btnNext.disabled = true) : ($btnNext.disabled = false);
}

// 페이징 번호 클릭 핸들러
async function handlerPageNumClick(index) {
    const $btns = $pagination.querySelectorAll('.num-list button');
    [...$btns].forEach(btn => btn.classList.remove('is-active'));
    event.currentTarget.classList.add('is-active');

    currentPage = index;
    oreumData = [];
    deleteMarker();
    await requestData(currentPage);

    $oreumList.replaceChildren();
    createListItem();
}

// 페이징 버튼 클릭 핸들러
async function handlerPageBtnClick() {
    const pageGroup = event.currentTarget.classList.contains('btn-prev') ? Math.ceil(currentPage / pageCount) - 1 : Math.ceil(currentPage / pageCount) + 1;

    console.log(pageGroup);

    currentPage = pageGroup * pageCount - (pageCount - 1);
    oreumData = [];
    deleteMarker();
    await requestData(currentPage);

    $numList.replaceChildren();
    createPagination(pageGroup);

    $oreumList.replaceChildren();
    createListItem();
}

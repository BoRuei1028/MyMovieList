//宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12
const movies = []
//儲存符合條件的電影
let filterMovies = []

//宣告節點
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設刷新
  event.preventDefault()
  //取得和整理輸入內容(清除空白、轉成小寫)
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  

  // 經trim()處理後，如果keyword.length = 0 則會轉成false，!false = true 執行該條件
  if(!keyword.length) {
    return alert ('請輸入有效字串')
  }

  //條件篩選 / 傳入filterMovies陣列
  filterMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  //錯誤處理 / 改以符合該條件之電影的陣列長度作為判斷，如果沒有符合電影 => 顯示提示框/
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字 ${keyword} 沒有符合條件的電影`)
  }
  console.log('有符合篩選條件之項目時將會出現')
  //依據搜尋結果重新製作分頁器
  renderPaginator(filterMovies.length)

  //渲染畫面/無論是否有無符合條件電影皆會渲染畫面
  renderMovieList(getMoviesByPage(1))

})

//監聽按鈕點擊
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(Number(e.target.dataset.id)) //使用dataset 取得data-id資料 / 轉成數字
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

//監聽分頁器
 paginator.addEventListener('click', function onPaginatorClicked(event){
    // 分頁器是占滿整行空間，點擊非分頁器的地方，event.target會是ul
    if (event.target.tagName !== 'A') return

    // console.log(event.target.dataset.page)
   const page = event.target.dataset.page
   renderMovieList(getMoviesByPage(page)) //取得頁碼 => 切割該頁碼陣列 => 渲染畫面

 })

//切割頁碼
function getMoviesByPage(page) {
  //判斷當前顯示搜尋結果或是全部
  const data = filterMovies.length ? filterMovies : movies

  // 0 - 11 / 12 - 23 / 24 - 35
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) //slice不包含end => slice(0, 12)
  
}

//計算頁數 amount: 資料比數
function renderPaginator(amount) {

  //計算總頁數 / 餘數 => 頁碼 + 1
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  //渲染分頁器
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//新增收藏清單
function addToFavorite(id) {
  // 將欲加入收藏清單的電影資料存入list / [] 處理首次加入清單情境
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //使用find()比對傳入id與電影清單id異同，將結果存入movie變數
  const movie = movies.find((movie) => movie.id === id)
  //some()回傳布林值 / 判斷是否有一元素符合callfunction的內容 / 回true表示該部電影id已存在於list中
  if (list.some((movie) => movie.id === id)) {
    //符合條件進入這個區塊return 表示不會再往下做push的動作
    return alert('這部電影已經在收藏清單中')
  }
  //非重複id / 推入list
  list.push(movie)
  //測試
  console.log(list)
  //轉成json格式字串 寫入localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//渲染modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(res => {
      // console.log(res.data.results)
      modalTitle.innerText = res.data.results.title
      modalDate.innerText = "Release date " + res.data.results.release_date
      modalDescription.innerText = res.data.results.description
      modalImage.innerHTML = `<img src=${POSTER_URL + res.data.results.image} alt="movie-poster" class="img-fluid">`
    })
    .catch(err => {
      console.error(err);
    })
}

//渲染畫面
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(element => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src=${POSTER_URL + element.image}
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${element.title}</h5>
            </div>
            <div class="card-footer">
              <a href="#" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${element.id}">More</a> <!-- 引入modal設定-->
              
              <a href="#" class="btn btn-info btn-add-favorite" data-id="${element.id}">+</a>
            </div>
          </div> 
        </div>
      </div><!-- col-sm-3 一部電影-->
    `
  });

  dataPanel.innerHTML = rawHTML
}

//取得電影資料
axios.get(INDEX_URL)
  .then(res => {
    //展開運算子
    movies.push(...res.data.results)
    // console.log(movies)
    // renderMovieList(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))  //將資料切割好後再做渲染
  })
  .catch(err => {
    console.error(err);
  })


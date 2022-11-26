const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector("#data-panel")

//來源為local storage
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

//監聽按鈕點擊
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(Number(e.target.dataset.id)) //使用dataset 取得data-id資料 / 轉成數字
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(e.target.dataset.id))
  }
})

//移除收藏清單
function removeFromFavorite(id) {
  //如果是空[] 就return
  if(!movies || !movies.length) return
  console.log(id)
  //使用findIIndex()比對傳入id與電影清單id異同，將結果存入movieIndex變數
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  //這行不太懂
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //重新渲染畫面 / 即時更新
  renderMovieList(movies)
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
              
              <a href="#" class="btn btn-danger btn-remove-favorite" data-id="${element.id}">X</a>
            </div>
          </div> 
        </div>
      </div><!-- col-sm-3 一部電影-->
    `
  });

  dataPanel.innerHTML = rawHTML
}

renderMovieList(movies)



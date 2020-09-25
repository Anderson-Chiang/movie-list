const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {  //讓函式都只做一件事情
  let rawHTML = ''

  data.forEach((item) => {
    // title, image, id
    // console.log(item)
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-madal-date')
  const modalDescription = document.querySelector('#movie-madal-description')

  axios.get(INDEX_URL + id).then((response) => {
    // response.data.results
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    // 圖片不是text，要改成innerHTML，記得要有標籤框<>，不然塞不進HTML裡面。
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" class="card-img-top" alt="movie-poster">`
  })
}

function removeFromFavorite (id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // return console.log(movieIndex)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies) // 讓畫面可以在刪除後即時更新
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) { //要改id - '.btn-remove-favorite'
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
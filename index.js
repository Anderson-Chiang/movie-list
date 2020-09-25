const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []  // 存放關鍵字搜尋的結果(分頁)

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList (data) {  //讓函式都只做一件事情
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator (amount) {
  // 80 / 12 = 6 ... 8 = 7
  const numbersOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numbersOfPages; page++) { //因為從0開始，所以page + 1
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>` //data-page綁定的是按鈕<a>標籤
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage (page) {
  // movies ? "movies" : "filteredMovies" (movies分兩種，一個是80部的陣列，一個是使用者用關鍵字搜尋出的陣列)
  const data = filteredMovies.length ? filteredMovies : movies // 如果f是有東西的，那就給我f。如果是空的，那就給我movies (三元運算子)
  //關鍵是"filteredMovies"的長度是不是大於零，如果"filteredMovies"大於零，代表使用者做了有效搜尋(所有只要顯示"filteredMovies"就好)

  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  // ...
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) // data 有可能是"movies"，也有可能是"filteredMovies" 
}

function showMovieModal (id) {
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

function addToFavorite (id) {
  // function isMovieIdMatched (movie) {
  //   return movie.id === id // 這裡的movie是函式裡的區域變數
  // }
  // console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // JSON.parse() 取出值，變成JS的陣列(或物件)
  const movie = movies.find(movie => movie.id === id) // 調用函式callback function
  
  // 檢查我的最愛裡，是否已經有重複收藏的電影
  if (list.some(movie => movie.id === id)) {  //  some 只會回報「陣列裡有沒有 item 通過檢查條件」，有的話回傳 true ，到最後都沒有就回傳 false(類似find)
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)
  // console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClicked (event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked (event) {
  if (event.target.tagName !== 'A') return // A 是指 <a> </a>標籤
  // console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page) //轉數字，因為dataset都是字串，但不知為何沒轉也跑得出來
  renderMovieList(getMoviesByPage(page)) // 更新分頁後的畫面 (第二次呼叫)
})


searchForm.addEventListener('submit', function onSearchFormSubmitted (event) {
  event.preventDefault() // 請瀏覽器不要做預設的動作(刷新頁面)，把控制權交給JS就好
  // console.log(searchInput.value)
  const keyword = searchInput.value.trim().toLowerCase() //.toLowerCase()讓搜尋可以不分大小寫 .trims()去掉輸入字串的前後空白字元
  

  // if (!keyword.length) {  //輸入的字串長度(字串不可以為零) ! === NOT
  //   return alert('Please enter a valid string.')
  // }

  // .map() .filter() .reduce() 陣列操作三寶
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword)) //最簡潔的寫法

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  // for (const movie of movies) { //for of 來判斷關鍵字
  //   if (movie.title.toLowerCase().includes(keyword)) { //判斷一個字符串是否包含在另一個字符串中，根據情況返回 true 或 false (條件設定也要注意大小寫)
  //     filteredMovies.push(movie)  // 再把搜尋到的movie推進去到filteredMovies這個陣列
  //   }
  // }
  renderPaginator(filteredMovies.length) //搜尋關鍵字後的結果，重新render分頁
  renderMovieList(getMoviesByPage(1)) //把篩選後的資料交給 renderMovieList(filteredMovies) //重新render後，資料再分頁(顯示出第1頁的搜尋結果) (第三次被呼叫)
})



axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results) // 沒有展開運算子的話，會變成一個只有 1 個元素的陣列
  renderPaginator(movies.length) // 呼叫分頁器函式(參數為所有的電影)
  renderMovieList(getMoviesByPage(1)) //首頁顯示分頁的第一頁 (第一次呼叫)
}).catch((err) => console.log(err)) //大括號也可以省略

// localStorage.setItem("default_language", "english")
// console.log(localStorage.getItem("default_language"))
// localStorage.removeItem("default_language")
// console.log(localStorage.getItem("default_language"))
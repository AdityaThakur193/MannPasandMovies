(() => {
  'use strict';

  // Movie dataset with some marked as editorsChoice
  const movies = [
    { id: 1, title: "Inception", year: 2010, rating: 8.8, genre: "Sci-Fi", description: "A thief who steals corporate secrets using dream-sharing technology is given the inverse task of planting an idea.", poster: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg", editorsChoice: true, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"}, {name: "JioHotstar", url: "https://www.hotstar.com"} ] },
    { id: 2, title: "Dilwale Dulhania Le Jayenge", year: 1995, rating: 8.0, genre: "Romance", description: "Raj and Simran meet during a trip across Europe and the two fall in love. However, when Raj learns that Simran is already promised to another, he follows her to India to win her and her father over.", poster: "https://upload.wikimedia.org/wikipedia/en/8/80/Dilwale_Dulhania_Le_Jayenge_poster.jpg", editorsChoice: true, platforms: [ {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 3, title: "Interstellar", year: 2014, rating: 8.6, genre: "Adventure", description: "A team travels through a wormhole in space in an attempt to ensure humanity's survival.", poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", editorsChoice: false, platforms: [ {name: "Amazon Prime", url: "https://www.primevideo.com"}, {name: "JioHotstar", url: "https://www.hotstar.com"} ]  },
    { id: 4, title: "Parasite", year: 2019, rating: 8.6, genre: "Thriller", description: "Greed and class discrimination threaten a newly formed symbiotic relationship between a wealthy family and a destitute one.", poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", editorsChoice: false, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 5, title: "The Shawshank Redemption", year: 1994, rating: 9.3, genre: "Drama", description: "Two imprisoned men bond over years, finding solace and eventual redemption.", poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", editorsChoice: true, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 6, title: "The Matrix", year: 1999, rating: 8.7, genre: "Action", description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", editorsChoice: false, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 7, title: "3 Idiots", year: 2009, rating: 8.4, genre: "Comedy, Drama", description: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.", poster: "https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg", editorsChoice: true, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 8, title: "Dangal", year: 2016, rating: 8.4, genre: "Biography, Drama, Sport", description: "Biopic on wrestler Mahavir Singh Phogat and his two wrestler daughters' struggle towards glory at the Commonwealth Games in the face of societal oppression.", poster: "https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg", editorsChoice: false, platforms: [{name: "NetFlix", url:"https://www.netflix.com"}, {name: "Amazon Prime", url: "https://www.primevideo.com"}, {name: "JioHotstar", url: "https://www.hotstar.com"} ]  },
    { id: 9, title: "Gully Boy", year: 2019, rating: 8.0, genre: "Drama, Music", description: "A coming-of-age story based on the lives of street rappers in Mumbai.", poster: "https://upload.wikimedia.org/wikipedia/en/0/07/Gully_Boy_poster.jpg", editorsChoice: false, platforms: [ {name: "Amazon Prime", url: "https://www.primevideo.com"} ]  },
    { id: 10, title: "Lagaan", year: 2001, rating: 8.1, genre: "Drama, History, Sport", description: "The inhabitants of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers.", poster: "https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan.jpg", editorsChoice: false, platforms: [{name: "NetFlix", url:"https://www.netflix.com"} ]  }
  ];

  // DOM elements
  const movieListEl = document.getElementById('movie-list');
  const searchInput = document.getElementById('search-input');
  const filterGenreEl = document.getElementById('filter-genre');
  const filterYearEl = document.getElementById('filter-year');
  const filterRatingEl = document.getElementById('filter-rating');
  const sortOptionEl = document.getElementById('sort-option');
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const darkModeToggleBtn = document.getElementById('dark-mode-toggle');
  const editorsChoiceListEl = document.getElementById('editors-choice-list');

  // Movie detail modal elements
  const detailOverlay = document.getElementById('movie-detail-overlay');
  const detailPoster = document.getElementById('detail-poster');
  const detailTitle = document.getElementById('detail-title');
  const detailYearGenre = document.getElementById('detail-year-genre');
  const detailRating = document.getElementById('detail-rating');
  const detailDescription = document.getElementById('detail-description');
  const platformsList = document.getElementById('platforms');
  const closeDetailBtn = document.getElementById('close-detail');

  // State for liked movies, loaded from localStorage if possible
  let likedMovies = new Set();
  try {
    likedMovies = new Set(JSON.parse(localStorage.getItem('likedMovies') || '[]'));
  } catch {
    likedMovies = new Set();
  }

if (localStorage.getItem('manpasand-theme') === 'light') {
  document.body.classList.add('light-mode');
  darkModeToggleBtn.textContent = 'Dark Mode'; // This is correct
  darkModeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  darkModeToggleBtn.setAttribute('aria-pressed', 'false');
} else {
  document.body.classList.add('dark-mode');
  darkModeToggleBtn.textContent = 'Light Mode'; // This should be 'Light Mode' for dark mode
  darkModeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
  darkModeToggleBtn.setAttribute('aria-pressed', 'true');
}
   
// Dismiss keyboard on pressing Enter
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchInput.blur(); // Remove focus from the input
  }
});

// Dismiss keyboard when clicking outside the input
document.addEventListener('click', (event) => {
  if (!searchInput.contains(event.target)) {
    searchInput.blur(); // Remove focus from the input
  }
});


   
let lastScrollTop = 0;
const filterBar = document.getElementById('filter-bar');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    filterBar.style.transform = 'translateY(-100%)'; // Move out of view
  } else {
    // Scrolling up
    filterBar.style.transform = 'translateY(0)'; // Move back into view
  }

  lastScrollTop = scrollTop;
});




  // Populate filters (genres and years)
  function populateGenres() {
    const genreSet = new Set();
    movies.forEach(m => {
      m.genre.split(',').forEach(g => genreSet.add(g.trim()));
    });
    const genres = Array.from(genreSet).sort((a,b) => a.localeCompare(b));
    genres.forEach(g => {
      const option = document.createElement('option');
      option.value = g;
      option.textContent = g;
      filterGenreEl.appendChild(option);
    });
  }

  function populateYears() {
    const years = Array.from(new Set(movies.map(m => m.year))).sort((a,b) => b - a);
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      filterYearEl.appendChild(option);
    });
  }

  // Create a movie card for main or editors choice (isEditorsChoice controls styling)
  function createMovieCard(movie, index, options = {}) {
    const { isEditorsChoice = false } = options;
    const card = document.createElement('article');
    card.classList.add('movie-card');
    card.setAttribute('tabindex', '0');

    if (isEditorsChoice) {
      card.style.minWidth = '220px';
      card.style.maxWidth = '220px';
      card.setAttribute('aria-label', `Editor's Choice: ${movie.title}, Year: ${movie.year}, Rating: ${movie.rating}, Genre: ${movie.genre}`);
    } else {
      card.setAttribute('aria-label', `${movie.title} (${movie.year}). Genre: ${movie.genre}. Rating: ${movie.rating}. Description: ${movie.description}`);
      card.style.animationDelay = index * 40 + 'ms';
    }

    const poster = document.createElement('img');
    poster.classList.add('movie-poster');
    poster.src = movie.poster;
    poster.alt = `Poster of ${movie.title}`;
    if (isEditorsChoice) poster.style.height = "280px";

    // Add click event to open movie detail
    poster.addEventListener('click', () => openMovieDetail(movie.id));

    const info = document.createElement('div');
    info.classList.add('movie-info');
    if (isEditorsChoice) info.style.padding = "0.8rem 1rem";

    const title = document.createElement('h2');
    title.classList.add('movie-title');
    title.textContent = movie.title;
    if (isEditorsChoice) title.style.fontSize = "1.1rem";

    const meta = document.createElement('div');
    meta.classList.add('movie-meta');
    if (isEditorsChoice) meta.style.fontSize = "0.8rem";
    const spanYear = document.createElement('span');
    spanYear.textContent = movie.year;
    meta.appendChild(spanYear);

    const genres = movie.genre.split(',').map(g => g.trim());
    genres.forEach(g => {
      const spanGenre = document.createElement('span');
      spanGenre.textContent = g;
      spanGenre.classList.add('genre');
      if (isEditorsChoice) {
        spanGenre.style.border = "none";
        spanGenre.style.backgroundColor = "rgba(252,163,17,0.6)";
        spanGenre.style.color = "#fff7cc";
      }
      meta.appendChild(spanGenre);
    });

    const spanRating = document.createElement('span');
    spanRating.textContent = `⭐ ${movie.rating.toFixed(1)}`;
    meta.appendChild(spanRating);

    const description = document.createElement('p');
    description.classList.add('movie-description');
    description.textContent = movie.description;

    // Add click event to open movie detail
    description.addEventListener('click', () => openMovieDetail(movie.id));

    const likeContainer = document.createElement('div');
    likeContainer.classList.add('like-container');

    const likeBtn = document.createElement('button');
    likeBtn.classList.add('like-button');
    likeBtn.type = 'button';
    likeBtn.dataset.movieId = movie.id;
    likeBtn.setAttribute('aria-pressed', likedMovies.has(movie.id));
    likeBtn.setAttribute('aria-label', likedMovies.has(movie.id) ? `Unlike ${movie.title}` : `Like ${movie.title}`);
    likeBtn.innerHTML = '❤️ ';

    const likeCount = document.createElement('span');
    likeCount.classList.add('like-count');
    likeCount.textContent = likedMovies.has(movie.id) ? 'Liked' : 'Like';
    likeBtn.appendChild(likeCount);

    likeBtn.addEventListener('click', () => toggleLike(movie.id, likeBtn));

    likeContainer.appendChild(likeBtn);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(description);
    info.appendChild(likeContainer);

    card.appendChild(poster);
    card.appendChild(info);

    return card;
  }

  // Open movie detail modal
  function openMovieDetail(movieId) {
  const movie = movies.find(m => m.id === movieId);
  if (!movie) return;

  // Populate details
  detailPoster.src = movie.poster;
  detailPoster.alt = `Poster of ${movie.title}`;
  detailTitle.textContent = movie.title;
  detailYearGenre.textContent = `${movie.year} | ${movie.genre}`;
  detailRating.textContent = `Rating: ⭐ ${movie.rating.toFixed(1)}`;
  detailDescription.textContent = movie.description;

  // Populate platforms (if any)
  platformsList.innerHTML = ''; // Clear previous platforms
  if (movie.platforms && movie.platforms.length > 0) {
    movie.platforms.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${p.url}" target="_blank" rel="noopener noreferrer" style="color:#fca311; font-weight:bold; text-decoration:none;">${p.name}</a>`;
      platformsList.appendChild(li);
    });
  } else {
    platformsList.textContent = 'Not available on known platforms.';
    platformsList.style.color = '#ddd';
  }

  // Show modal
  detailOverlay.style.display = 'block';
  detailOverlay.setAttribute('aria-hidden', 'false');
  closeDetailBtn.focus();
}

  // Close movie detail modal
  function closeMovieDetail() {
    detailOverlay.style.display = 'none';
    detailOverlay.setAttribute('aria-hidden', 'true');
  }

  // Toggle like/unlike and update localStorage
  function toggleLike(movieId, btn) {
    if (likedMovies.has(movieId)) {
      likedMovies.delete(movieId);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Unlike', 'Like'));
      btn.querySelector('.like-count').textContent = 'Like';
      btn.classList.remove('liked');
    } else {
      likedMovies.add(movieId);
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Like', 'Unlike'));
      btn.querySelector('.like-count').textContent = 'Liked';
      btn.classList.add('liked');
    }
    try {
      localStorage.setItem('likedMovies', JSON.stringify(Array.from(likedMovies)));
    } catch {}
    btn.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.3)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 400, easing: 'ease-out' });
  }

  // Filter and sort movies based on current UI controls
  function applyFiltersAndSort() {
    const searchStr = searchInput.value.trim().toLowerCase();
    const genreFilter = filterGenreEl.value.toLowerCase();
    const yearFilter = filterYearEl.value;
    const ratingFilter = parseFloat(filterRatingEl.value) || 0;
    const sortOption = sortOptionEl.value;

    let filtered = movies.filter(movie => {
      const titleMatch = movie.title.toLowerCase().includes(searchStr);
      const genres = movie.genre.split(',').map(g => g.trim().toLowerCase());
      const genreMatch = genreFilter ? genres.includes(genreFilter) : true;
      const yearMatch = yearFilter ? movie.year.toString() === yearFilter : true;
      const ratingMatch = movie.rating >= ratingFilter;
      return titleMatch && genreMatch && yearMatch && ratingMatch;
    });

    switch(sortOption) {
      case 'title-asc': filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
      case 'title-desc': filtered.sort((a,b) => b.title.localeCompare(a.title)); break;
      case 'year-desc': filtered.sort((a,b) => b.year - a.year); break;
      case 'year-asc': filtered.sort((a,b) => a.year - b.year); break;
      case 'rating-desc': filtered.sort((a,b) => b.rating - a.rating); break;
      case 'rating-asc': filtered.sort((a,b) => a.rating - b.rating); break;
      default: filtered.sort((a,b) => a.id - b.id); break;
    }

    return filtered;
  }

  // Show loading skeletons while filtering
  function renderLoadingSkeleton() {
    movieListEl.innerHTML = '';
    for (let i=0; i<8; i++) {
      const skeletonCard = document.createElement('article');
      skeletonCard.classList.add('movie-card');
      skeletonCard.setAttribute('aria-hidden', 'true');
      skeletonCard.innerHTML = `
        <div class="skeleton poster"></div>
        <div class="movie-info">
          <div class="skeleton text" style="width: 60%;"></div>
          <div class="skeleton text" style="width: 40%; margin-top: 0.2rem;"></div>
          <div class="skeleton text" style="width: 80%; margin-top: 0.8rem; height: 52px;"></div>
          <div class="skeleton button"></div>
        </div>
      `;
      movieListEl.appendChild(skeletonCard);
    }
  }

  // Render movies in main list
  function renderMovieCards() {
    renderLoadingSkeleton();

    setTimeout(() => {
      const filteredMovies = applyFiltersAndSort();
      movieListEl.innerHTML = '';

      if(filteredMovies.length === 0) {
        const noMoviesMsg = document.createElement('p');
        noMoviesMsg.style.padding = '2rem';
        noMoviesMsg.style.textAlign = 'center';
        noMoviesMsg.style.color = '#fca311cc';
        noMoviesMsg.textContent = 'No movies match your criteria.';
        movieListEl.appendChild(noMoviesMsg);
        return;
      }

      filteredMovies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        movieListEl.appendChild(card);
      });
    }, 600);
  }

  // Render Editor's Choice movies horizontally
  function renderEditorsChoice() {
    editorsChoiceListEl.innerHTML = '';
    const editorsMovies = movies.filter(m => m.editorsChoice);
    editorsMovies.forEach(movie => {
      const card = createMovieCard(movie, 0, { isEditorsChoice: true });
      editorsChoiceListEl.appendChild(card);
    });
  }

  // Setup event listeners
  function setUpEventListeners() {
    searchInput.addEventListener('input', renderMovieCards);
    filterGenreEl.addEventListener('change', renderMovieCards);
    filterYearEl.addEventListener('change', renderMovieCards);
    filterRatingEl.addEventListener('change', renderMovieCards);
    sortOptionEl.addEventListener('change', renderMovieCards);

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight / 2) {
        scrollTopBtn.classList.add('visible');
        scrollTopBtn.setAttribute('aria-hidden', 'false');
      } else {
        scrollTopBtn.classList.remove('visible');
        scrollTopBtn.setAttribute('aria-hidden', 'true');
      }
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollTopBtn.blur();
    });

    darkModeToggleBtn.addEventListener('click', () => {
      if(document.body.classList.contains('dark-mode')) {
        document.body.classList.replace('dark-mode', 'light-mode');
        darkModeToggleBtn.textContent = 'Dark Mode';
        localStorage.setItem('manpasand-theme', 'light');
        darkModeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        darkModeToggleBtn.setAttribute('aria-pressed', 'false');
      } else if(document.body.classList.contains('light-mode')) {
        document.body.classList.replace('light-mode', 'dark-mode');
        darkModeToggleBtn.textContent = 'Light Mode';
        localStorage.setItem('manpasand-theme', 'dark');
        darkModeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
        darkModeToggleBtn.setAttribute('aria-pressed', 'true');
      }
    });

    closeDetailBtn.addEventListener('click', closeMovieDetail);
    detailOverlay.addEventListener('click', (event) => {
      if (event.target === detailOverlay) {
        closeMovieDetail();
      }
    });
  }

  

  // Initialize the application
  function init() {
    populateGenres();
    populateYears();
    renderEditorsChoice();
    renderMovieCards();
    setUpEventListeners();
  }

  // Run the initialization function
  init();
})();

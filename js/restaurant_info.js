let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL(((error, restaurant) => {
    fillRestaurantHTML(restaurant);
  }));
});
/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  
  const name = document.getElementById('restaurant-name');
  if(restaurant.is_favorite) {
    name.innerHTML = restaurant.name + `<div class="fav-icon">★</div>`;
  } else {
    name.innerHTML = restaurant.name;
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `A photo from the restaurant ${restaurant.name}`
  image.src = DBHelper.imageJpgUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  if (restaurant.is_favorite) {
    document.querySelector('.fav').classList.add('is-favourite');
    document.querySelector('.fav').innerText = 'Unfavourite';
  }

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  fillReviewsHTML(restaurant.reviews);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.classList.add('review__name');
  li.appendChild(name);
  
  const date = document.createElement('p');
  let formattedDate = new Date(review.updatedAt);
  let day = formattedDate.getDate();
  let month = formattedDate.getMonth();
  let year = formattedDate.getFullYear();
  date.innerHTML = `${day}/${month}/${year}`;
  date.classList.add('review__date')
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.classList.add('review__rating');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.tabIndex = 0;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Switch static map
swap_map = () => {    
  document.getElementById('map').style.display = 'block';
  document.getElementById('static_map').style.display = 'none';
  if (window.innerWidth <= 768) {
    document.getElementById('map-container').style.height = '30vh';
  }
}

// update header and fav button styles
updateFavStyles = (fav) => {
  
  if (fav) {
    document.querySelector('.fav').classList.add('is-favourite');
    document.querySelector('.fav').innerText = 'Unfavourite';
    let headerText = document.querySelector('#restaurant-name');
    headerText.innerHTML = headerText.innerText + '<div class="fav-icon">★</div>';
  }
  if (!fav) {
    document.querySelector('.fav').classList.remove('is-favourite');
    document.querySelector('.fav').innerText = 'Mark as favourite';
    document.querySelector('.fav-icon').style.display = 'none';
  }
}

// Toggle favourite
markFavourite = () => {
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No id in URL'
    callback(error, null);
  } else {
    // get restaurant
    DBHelper.fetchRestaurantById(id, (error, fav) => {
        let url = `${DBHelper.DATABASE_URL_RESTAURANTS}/${id}`;
        // get is fav
        let is_fav = fav.is_favorite;

        // set is_fav to true or false
        is_fav = !is_fav;

        // push back to data
        fetch(url, {
          body: JSON.stringify({is_favorite: is_fav}),
          method: 'POST',
          mode: 'cors'}
        ).then(IDBHelper.toggleFavouriteIDB(id));

        updateFavStyles(is_fav);
        
    });
  }
}

// review modal variables
let focusElementBeforeModal;
const leaveReviewModal = document.querySelector('.leave-review-container');
const reviewModalInner = document.querySelector('.leave-review-container div');

// Open leave a review form
openLeaveReviewForm = () => {
  focusElementBeforeModal = document.activeElement;
  leaveReviewModal.classList.add('open-modal');
  reviewModalInner.addEventListener('keydown', trapTab);
  let focusableElements = 'input, button'
  let tabElements = Array.from(reviewModalInner.querySelectorAll(focusableElements));

  let firstTabStop = tabElements[0];
  let lastTabStop = tabElements[tabElements.length - 1];

  firstTabStop.focus();

  function trapTab(e) {
    if (e.keyCode === 9) {
      // shift + tab
      if (e.shiftKey) {
        if (document.activeElement === firstTabStop) {
          e.preventDefault();
          lastTabStop.focus();
        }
      
      // tab
      } else {
        if (document.activeElement === lastTabStop) {
          e.preventDefault();
          firstTabStop.focus();
        }
      }
    }
    // escape to close
    if (e.keyCode === 27) {
      closeReviewForm();
    }
  }

}

closeReviewForm = () => {
  leaveReviewModal.classList.remove('open-modal');
  focusElementBeforeModal.focus();
}


// Submit review
submitReview = () => {
  
  const name = document.querySelector('#review-name').value;
  const text = document.querySelector('#review-text').value;
  const ratingInputs = Array.from(document.querySelectorAll('.leave-review-container input[type="radio"]'));
  const rating = ratingInputs.filter(r => r.checked);
  const ratingValue = rating[0].value;
  let restaurant_id = getParameterByName('id');
  
  // close review form
  leaveReviewModal.classList.remove('open-modal');
  focusElementBeforeModal.focus();
  
  // post to reviews db
  let url = `${DBHelper.DATABASE_URL_REVIEWS}/`;
  
  let review = {
    restaurant_id: restaurant_id,
    name: name,
    rating: ratingValue,
    comments: text,
  };

  addToCacheThenFetch(restaurant_id, url, review);
  
  // add new review to HTML
  let newReview = createReviewHTML(review);
  document.querySelector('#reviews-list').appendChild(newReview);
}

function addToCacheThenFetch(id, url, data) {

  fetch(url, {
    body: JSON.stringify(data),
    method: 'POST',
    mode: 'cors'}
  )
  .then(IDBHelper.postReviewToIDB(id, data))
  .catch(() => {storeAndSyncWhenOnline(data);})
}

function storeAndSyncWhenOnline(review) {
  if (navigator.onLine) return;

  localStorage.setItem('review', JSON.stringify(review));
  console.log('No connection. Review stored and will sync when possible');

  window.addEventListener('online', () => {
      let data = JSON.parse(localStorage.getItem('data'));

      if(data !== null) {
        let url = `${DBHelper.DATABASE_URL_REVIEWS}/`;
        addToCacheThenFetch(data.restaurant_id, url, data);
        
        // clear out localStorage after sync
        localStorage.removeItem('data');
      }
  });
}
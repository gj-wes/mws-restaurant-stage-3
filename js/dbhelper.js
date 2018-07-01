/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Restaurant Database URL.
   */
  static get DATABASE_URL_RESTAURANTS() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Reviews Database URL.
   */
  static get DATABASE_URL_REVIEWS() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const dbPromise = idb.open('restaurants-db', 1, (upgradeDb) => {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will
          // execute when the database is first created
          // (oldVersion is 0)
        case 1:
          // create restaurants objectstore
          upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id'
          });
      }
    });

    const createDB = (restaurants) => {
      dbPromise.then((db) => {
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');

        return Promise.all(restaurants.map(function (restaurant) {
            return store.add(restaurant);
          }))
          .catch((e) => {
            tx.abort();
            console.log(e);
          })
          .then(() => {
            console.log('All restaurant data stored to IDB');
          });
      });
    }

    const getFromDB = (db) => {
      dbPromise.then(db => {
        return db.transaction('restaurants')
          .objectStore('restaurants').getAll();
      }).then(allRestaurants => {
        // return allRestaurants;
        return callback(null, allRestaurants);
      }).catch(err => {
        console.error(err);
      });
    }

    fetch(DBHelper.DATABASE_URL_RESTAURANTS)
      .then(res => res.json())
      .then(data => {
        const restaurants = data;
        // create idb store with returned data
        createDB(restaurants);
        callback(null, restaurants);
      })
      .catch(err => {
        // return cached data
        console.error(err);
        console.log('Unable to fetch data from server. Using cache data instead');
        return getFromDB(callback);
      });
  }
  /**
   * Fetch all restaurant reviews.
   */
  static fetchRestaurantReviews(callback) {
    const dbPromise = idb.open('restaurants-reviews-db', 1, (upgradeDb) => {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will
          // execute when the database is first created
          // (oldVersion is 0)
        case 1:
          // create restaurants objectstore
          upgradeDb.createObjectStore('reviews', {
            keyPath: 'id'
          });
      }
    });

    const createDB = (reviews) => {
      dbPromise.then((db) => {
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');

        return Promise.all(reviews.map(function (review) {
            return store.add(review);
          }))
          .catch((e) => {
            tx.abort();
            console.log(e);
          })
          .then(() => {
            console.log('All review data stored to IDB');
          });
      });
    }

    const getFromDB = (db) => {
      dbPromise.then(db => {
        return db.transaction('reviews')
          .objectStore('reviews').getAll();
      }).then(allReviews => {
        // return allReviews;
        return callback(null, allReviews);
      }).catch(err => {
        console.error(err);
      });
    }

    fetch(DBHelper.DATABASE_URL_REVIEWS)
      .then(res => res.json())
      .then(data => {
        const reviews = data;
        // create idb store with returned data
        createDB(reviews);
        callback(null, reviews);
      })
      .catch(err => {
        // return cached data
        console.error(err);
        console.log('Unable to fetch data from server. Using cache data instead');
        return getFromDB(callback);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }
  /**
   * Fetch a reviews by its ID.
   */
  static fetchReviewsById(restaurant_id, callback) {
    // fetch all reviews with proper error handling.
    DBHelper.fetchRestaurantReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const review = reviews.filter(r => r.restaurant_id == restaurant_id);
        if (review) { // Got the review
          callback(null, review);
        } else { // Review does not exist in the database
          callback('Review does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageJpgUrlForRestaurant(restaurant) {
    if(restaurant.photograph) { 
      return `/img/${restaurant.photograph}.jpg`;
    } else {
       return `/img/${restaurant.id}.jpg`;
    };
  }

  static imageWebpForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return `/img/${restaurant.photograph}.webp`;
    } else {
      return `/img/${restaurant.id}.webp`;
    };
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

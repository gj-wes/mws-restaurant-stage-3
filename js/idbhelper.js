class IDBHelper {
  // set dbPromise
  static get dbPromise() {
    const dbPromise = idb.open('restaurants-db', 2, (upgradeDb) => {
      switch(upgradeDb.oldVersion) {
        case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
        case 1:
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
          console.log('restaurants-db has been created!');
      }
    });
    return dbPromise;
  }

  // add restaurant data to DB and merge with review data
  static populateIDB(dbPromise) {
    fetch(DBHelper.DATABASE_URL_RESTAURANTS)
      .then(res => res.json())
      .then(json => {
        json.map(restaurant => IDBHelper.addReviewData(restaurant, dbPromise))
        console.log('added to db');
      });
  }
  static addReviewData(restaurant, dbPromise) {
    let id = restaurant.id;
    fetch(`${DBHelper.DATABASE_URL_REVIEWS}/?restaurant_id=${id}`)
      .then(res => res.json())
      .then(reviewsToAdd=> dbPromise.then(
        db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          let item = restaurant;
          item.reviews = reviewsToAdd;
          store.put(item);
          console.log('reviews added to db');
          tx.complete;
        })
      )
  }

  // get all data from DB
  static getRestaurantInfo(dbPromise) {
    return dbPromise.then(db => {
      return db.transaction('restaurants').objectStore('restaurants').getAll();
    })
  }

  // toggle favourite
  static toggleFavouriteIDB(id) {
    IDBHelper.dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants')
      store.get(Number(id)).then(res => {
          res.is_favorite = !res.is_favorite;
          store.put(res);
        })
    });
  }
  
  // post a review
  static postReviewToIDB(id, body) {
    IDBHelper.dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite')
      const store = tx.objectStore('restaurants')
      store.get(Number(id)).then(res => {
        res.reviews.push(body);
        store.put(res);
      })
    });
  }
}
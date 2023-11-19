import axios from 'axios';

export class PixabayAPI {
  #API_KEY = '40712240-584c6352de5cb384d1e409b2f';
  #query = '';

  constructor() {
    this.page = 1;
    this.#query = null;
    this.perPage = 40;
    axios.defaults.baseURL = 'https://pixabay.com/api';
  }

  getPhotosByQuery(q) {
    const options = {
      params: {
        q: q,
        page: this.page,
        per_page: 20,
        image_type: 'photo',
        orientation: 'horizontal',
        per_page: this.perPage,
        safesearch: true,
        key: this.#API_KEY,
      },
    };

    return axios.get(`?/search/photos/`, options);
  }

  // // Сетер для запису searchQuery
  set query(newQuery) {
    this.#query = newQuery;
  }
}

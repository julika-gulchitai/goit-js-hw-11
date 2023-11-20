import Notiflix from 'notiflix';
import { form, gallery, loadMore } from './js/refs';
import { PixabayAPI } from './js/pixabay-api';
import { createMarkup } from './js/markup';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const instance = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const pixabay = new PixabayAPI();
let searchSubject = '';

const onGetQuerySubmit = async event => {
  event.preventDefault();
  const { target: form } = event;
  // if (event.currentTarget.elements.searchQuery.value !== '') form.reset;
  console.log(event.currentTarget.elements.searchQuery.value);
  searchSubject = event.currentTarget.elements.searchQuery.value.trim();
  pixabay.q = searchSubject;

  pixabay.page = 1;
  try {
    const { data } = await pixabay.getPhotosByQuery(searchSubject);
    if (data.total === 0) {
      gallery.innerHTML = '';
      loadMore.classList.add('is-hidden');
      Notiflix.Notify.warning('Please, enter word to search query');
      form.reset();
      return;
    }
    if (data.total === 1) {
      gallery.innerHTML = createMarkup(data.hits);
      loadMore.classList.add('is-hidden');
      return;
    }

    gallery.innerHTML = createMarkup(data.hits);
    instance.refresh();

    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
    if (data.total >= 40) {
      loadMore.classList.remove('is-hidden');
    }
  } catch (err) {
    Notiflix.Notify.failure('Sorry! Invalid request. Something went wrong...');
  }
};

const onLoadmorePhoto = async () => {
  pixabay.page += 1;
  try {
    const { data } = await pixabay.getPhotosByQuery(searchSubject);
    gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    instance.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (pixabay.page === Math.trunc(data.total / pixabay.perPage)) {
      loadMore.classList.add('is-hidden');
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results.",
        {
          timeout: 3000,
        }
      );
    }
  } catch (err) {
    Notiflix.Notify.failure('Sorry! Invalid request. Something went wrong...');
  }
};
form.addEventListener('submit', onGetQuerySubmit);
loadMore.addEventListener('click', onLoadmorePhoto);
searchSubject = '';

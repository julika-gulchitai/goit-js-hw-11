import Notiflix from 'notiflix';
import { form, gallery, loadMore } from './js/refs';
import { PixabayAPI } from './js/pixabay-api';
import { createMarkup } from './js/markup';

// let query = '';
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
      form.reset();
      return;
    }
    if (data.total === 1) {
      gallery.innerHTML = createMarkup(data.hits);
      loadMore.classList.add('is-hidden');
      return;
    }

    gallery.innerHTML = createMarkup(data.hits);
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

let instance = 0;
const onGalleryImgClick = event => {
  const sourcePath = event.currentTarget;

  if (event.target.tagName !== 'IMG') return;
  instance = basicLightbox.create(
    `
    <img class="modal" src="${sourcePath.largeImageURL}" >`,
    {
      onShow: () => {
        document.addEventListener('keydown', onEscapeKeyClick);
      },
      onClose: () => {
        document.removeEventListener('keydown', onEscapeKeyClick);
      },
    }
  );

  event.preventDefault();
  instance.show();
};
bigPhoto.addEventListener('click', onGalleryImgClick);

function onEscapeKeyClick(event) {
  if (event.code !== 'Escape') return;
  instance.close();
}

// document.addEventListener('DOMContentLoaded', onRenderPage);

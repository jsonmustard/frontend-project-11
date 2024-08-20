import i18next from 'i18next';
import validate from './models/validation.js';
import ru from './locales/ru.js';
import state from './models/state.js';
import handleUrl from './models/rssService.js';

const updateFeeds = () => {
  const promises = state.feeds.map((feed) => handleUrl(feed.url));
  Promise.all(promises).then(() => setTimeout(() => updateFeeds(), 5000));
};

const initializeEventHandlers = () => {
  const inputUrlElement = document.getElementById('url-input');
  const submitButtonElement = document.getElementById('submit-button');
  const postsContainer = document.querySelector('.posts');

  inputUrlElement.addEventListener('change', () => {
    state.form.url = inputUrlElement.value;
  });

  submitButtonElement.addEventListener('click', async (e) => {
    if (!inputUrlElement.checkValidity()) {
      return;
    }

    e.preventDefault();

    state.form.isActive = false;

    validate(state.form.url)
      .then(() => {
        const isDuplicate = state.feeds.some((feed) => feed.url === state.form.url);
        if (isDuplicate) {
          const error = new Error('duplication');
          error.errors = 'duplication';
          throw error;
        }
      })
      .then(() => handleUrl(state.form.url))
      .catch((err) => {
        state.form.feedback = err.errors;
      })
      .finally(() => {
        state.form.isActive = true;
      });
  });

  postsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      const postId = e.target.dataset.id;
      state.posts.find((i) => i.id === postId).isRead = true;
    } else if (e.target.tagName === 'BUTTON') {
      const postId = e.target.dataset.id;
      state.modal.postId = postId;
      state.posts.find((i) => i.id === postId).isRead = true;
    }
  });
};

const app = () => {
  i18next
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then(updateFeeds())
    .then(initializeEventHandlers());
};

export default app;

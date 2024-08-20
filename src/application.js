import i18next from 'i18next';
import validate from './models/validation.js';
import ru from './locales/ru.js';
import state from './models/state.js';
import handleUrl from './models/rssService.js';
import {
  renderFeeds, renderPosts, renderForm, renderModal,
} from './views.js';

const feedUpdater = () => {
  const promises = state.feeds.map((feed) => handleUrl(feed.url));
  Promise.all(promises)
    .then(() => {
      if (state.feeds.length !== 0) {
        renderPosts(state);
      }
    })
    .then(() => setTimeout(() => feedUpdater(), 5000));
};

feedUpdater();

const app = () => {
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
        if (state.feeds.some((feed) => feed.url === state.form.url)) {
          const error = new Error('duplication');
          error.errors = 'duplication';
          throw error;
        }
      })
      .then(() => handleUrl(state.form.url))
      .then(() => renderForm(state))
      .then(() => renderFeeds(state))
      .then(() => renderPosts(state))
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
      renderPosts(state);
    } else if (e.target.tagName === 'BUTTON') {
      const postId = e.target.dataset.id;
      renderModal(state, postId);
      state.posts.find((i) => i.id === postId).isRead = true;
      renderPosts(state);
    }
  });
};

const runApp = () => {
  i18next
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then(app());
};

export default runApp;

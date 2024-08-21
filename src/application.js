import i18next from 'i18next';
import validate from './models/validation.js';
import ru from './locales/ru.js';
import handleUrl from './models/rssService.js';
import watch from './views.js';

const initialState = {
  form: {
    isDisabled: false,
    url: '',
    feedback: '',
  },
  rss: {},
  feeds: [],
  posts: [],
  modal: {
    postId: null,
  },
};

const elements = {
  inputUrlElement: document.getElementById('url-input'),
  submitButtonElement: document.getElementById('submit-button'),
  postsContainer: document.querySelector('.posts'),
  feedsContainer: document.querySelector('.feeds'),
  titleElement: document.querySelector('.modal-title'),
  bodyElement: document.querySelector('.modal-body'),
  linkElement: document.querySelector('.modal-footer > a'),
  feedbackMessageElement: document.getElementById('feedback-message'),
};

const initializeEventHandlers = () => {
  const watchedState = watch(elements, initialState);

  const updateFeeds = () => {
    const promises = watchedState.feeds.map((feed) => handleUrl(feed.url, watchedState));
    Promise.all(promises).finally(() => setTimeout(() => updateFeeds(), 5000));
  };

  elements.inputUrlElement.addEventListener('change', () => {
    watchedState.form.url = elements.inputUrlElement.value;
  });

  elements.submitButtonElement.addEventListener('click', async (e) => {
    if (!elements.inputUrlElement.checkValidity()) {
      return;
    }

    e.preventDefault();

    watchedState.form.isActive = false;

    validate(watchedState)
      .then(() => handleUrl(watchedState.form.url, watchedState))
      .catch((err) => {
        watchedState.form.feedback = err.errors;
      })
      .finally(() => {
        watchedState.form.isActive = true;
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      const postId = e.target.dataset.id;
      watchedState.posts.find((i) => i.id === postId).isRead = true;
    } else if (e.target.tagName === 'BUTTON') {
      const postId = e.target.dataset.id;
      watchedState.modal.postId = postId;
      watchedState.posts.find((i) => i.id === postId).isRead = true;
    }
  });

  updateFeeds();
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
    .then(() => {
      initializeEventHandlers();
    });
};

export default app;

import onChange from 'on-change';
import i18next from 'i18next';
import validate from './validation.js';
import ru from './locales/ru.js';

const app = async () => {
  const state = {
    ui: {
      url: '',
      error: '',
    },
  };

  const urlInputElement = document.getElementById('url-input');
  const submitButtonElement = document.getElementById('submit-button');
  const feedbackMessageElement = document.getElementById('feedback-message');

  const watchedState = onChange(state, (path, value) => {
    console.log(path);
    switch (path) {
      case 'ui.url':
        break;
      case 'ui.error':
        feedbackMessageElement.textContent = value;
        if (value === '') {
          urlInputElement.classList.remove('is-invalid');
        } else {
          urlInputElement.classList.add('is-invalid');
        }
        break;
      default:
        console.log('error');
    }
  });

  urlInputElement.addEventListener('change', () => {
    watchedState.ui.url = urlInputElement.value;
  });

  submitButtonElement.addEventListener('click', async (e) => {
    e.preventDefault();

    validate(watchedState.ui.url)
      .then(() => {
        watchedState.ui.error = '';
      })
      .catch((err) => {
        watchedState.ui.error = i18next.t(`form.validation.error.${err.errors}`);
      });
  });
};

const runApp = async () => {
  await i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  app();
};

export default runApp;

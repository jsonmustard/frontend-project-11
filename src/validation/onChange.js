import onChange from 'on-change';
import validate from './validation';

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

  const watchedState = onChange(state, (path, value, previousValue) => {
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
        watchedState.ui.error = err.errors;
      });
  });
};

export default app;

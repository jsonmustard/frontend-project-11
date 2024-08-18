import i18next from 'i18next';
import onChange from 'on-change';

const state = {
  url: '',
  feedback: '',
  rss: {},
  feeds: [],
  posts: [],
};

const urlInputElement = document.getElementById('url-input');
const feedbackMessageElement = document.getElementById('feedback-message');

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'url':
      break;
    case 'feedback':
      feedbackMessageElement.textContent = i18next.t(`form.${path}.${value}`);
      if (value === 'success') {
        urlInputElement.classList.remove('is-invalid');
        feedbackMessageElement.classList.remove('text-danger');
        feedbackMessageElement.classList.add('text-success');
      } else {
        urlInputElement.classList.add('is-invalid');
        feedbackMessageElement.classList.add('text-danger');
        feedbackMessageElement.classList.remove('text-success');
      }
      break;
    default:
  }
});

export default watchedState;

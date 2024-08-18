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

const setFeedbackStyles = (isValid) => {
  urlInputElement.classList.toggle('is-invalid', !isValid);
  feedbackMessageElement.classList.toggle('text-danger', !isValid);
  feedbackMessageElement.classList.toggle('text-success', isValid);
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'url':
      break;
    case 'feedback':
      feedbackMessageElement.textContent = i18next.t(`form.${path}.${value}`);
      setFeedbackStyles(value === 'success');
      break;
    default:
  }
});

export default watchedState;

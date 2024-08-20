import onChange from 'on-change';
import i18next from 'i18next';
import {
  renderFeeds, renderPosts, renderForm, renderModal,
} from '../views.js';

const state = {
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

const urlInputElement = document.getElementById('url-input');
const feedbackMessageElement = document.getElementById('feedback-message');

const setFeedbackStyles = (isValid) => {
  urlInputElement.classList.toggle('is-invalid', !isValid);
  feedbackMessageElement.classList.toggle('text-danger', !isValid);
  feedbackMessageElement.classList.toggle('text-success', isValid);
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.url':
      renderForm(watchedState);
      break;
    case 'form.feedback':
      feedbackMessageElement.textContent = i18next.t(`${path}.${value}`);
      setFeedbackStyles(value === 'success');
      break;
    case 'feeds':
      renderFeeds(watchedState);
      break;
    case 'posts':
      renderPosts(watchedState);
      break;
    case 'modal.postId':
      if (value !== null) {
        renderModal(watchedState, value);
      }
      break;
    default:
      if (path.startsWith('posts.')) {
        renderPosts(watchedState);
      }
  }
});

export default watchedState;

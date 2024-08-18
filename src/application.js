import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';
import validate from './validation.js';
import ru from './locales/ru.js';

const app = async () => {
  const state = {
    url: '',
    feedback: '',
    rss: {},
    feeds: [],
    posts: [],
  };

  const urlInputElement = document.getElementById('url-input');
  const submitButtonElement = document.getElementById('submit-button');
  const feedbackMessageElement = document.getElementById('feedback-message');

  const watchedState = onChange(state, (path, value) => {
    // console.log(path);
    switch (path) {
      case 'url':
        break;
      case 'feedback':
        feedbackMessageElement.textContent = i18next.t(`form.${path}.${value}`);
        // console.log(value);
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
        // console.log('error');
    }
  });

  urlInputElement.addEventListener('change', () => {
    watchedState.url = urlInputElement.value;
  });

  const getXml = (url) => fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error('Network response was not ok.');
    })
    .then((data) => data.contents);

  const parseXml = (xmlString) => {
    const parser = new DOMParser();
    const feedId = _.uniqueId();
    const feed = parser.parseFromString(xmlString, 'text/xml');
    const feedTitle = feed.querySelector('title').textContent;
    const feedDescription = feed.querySelector('description').textContent;

    const feedItem = {
      id: feedId,
      url: watchedState.url,
      title: feedTitle,
      description: feedDescription,
    };

    watchedState.feeds.push(feedItem);

    const items = Array.from(feed.querySelectorAll('item'));

    items.map((post) => watchedState.posts.push({
      id: _.uniqueId(),
      feedId,
      title: post.querySelector('title').textContent,
      description: post.querySelector('description').textContent,
      link: post.querySelector('link').textContent,
    }));
  };

  const render = () => {
    const fillFeedsContainer = () => {
      const feedsContained = document.querySelector('.feeds');

      const divCard = document.createElement('div');
      divCard.className = 'card border-0';
      feedsContained.appendChild(divCard);

      const divCardBody = document.createElement('div');
      divCardBody.className = 'card-body';
      divCard.appendChild(divCardBody);

      const h2 = document.createElement('h2');
      h2.className = 'card-title h4';
      h2.textContent = 'Фиды';
      divCardBody.appendChild(h2);

      const ul = document.createElement('ul');
      ul.className = 'list-group border-0 rounded-0';
      divCard.appendChild(ul);
      state.feeds.forEach((feed) => {
        const li = document.createElement('li');
        li.className = 'list-group-item border-0 border-end-0';

        const h3 = document.createElement('h3');
        h3.className = 'h6 m-0';
        h3.textContent = feed.title;
        li.appendChild(h3);

        const p = document.createElement('p');
        p.className = 'm-0 small text-black-50';
        p.textContent = feed.description;
        li.appendChild(p);

        ul.appendChild(li);
      });
    };

    const fillPostsContainer = () => {
      const postsContainer = document.querySelector('.posts');

      const divCard = document.createElement('div');
      divCard.className = 'card border-0';
      postsContainer.appendChild(divCard);

      const divCardBody = document.createElement('div');
      divCardBody.className = 'card-body';
      divCard.appendChild(divCardBody);

      const h2 = document.createElement('h2');
      h2.className = 'card-title h4';
      h2.textContent = 'Посты';
      divCardBody.appendChild(h2);

      const ul = document.createElement('ul');
      ul.className = 'list-group border-0 rounded-0';
      divCard.appendChild(ul);

      state.posts.forEach((post) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

        const a = document.createElement('a');
        a.href = post.link;
        a.className = 'fw-bold';
        a.dataset.id = post.id;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = post.title;
        li.appendChild(a);

        const fillModal = (e) => {
          const postId = e.target.dataset.id;
          console.log(postId);
          console.log(state.posts);
          const titleElement = document.querySelector('.modal-title');
          const bodyElement = document.querySelector('.modal-body');
          const linkElement = document.querySelector('.modal-footer > a');
          const { title, description, link } = state.posts.find((i) => i.id === postId);
          titleElement.textContent = title;
          bodyElement.textContent = description;
          linkElement.href = link;
        };

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary btn-sm';
        button.dataset.id = post.id;
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#modal';
        button.textContent = 'Просмотр';
        button.addEventListener('click', (e) => {
          fillModal(e);
        });
        li.appendChild(button);

        ul.appendChild(li);
      });
    };

    fillFeedsContainer();
    fillPostsContainer();
  };

  submitButtonElement.addEventListener('click', async (e) => {
    e.preventDefault();

    validate(watchedState.url)
      .then(() => {
        if (watchedState.feeds.some((feed) => feed.url === watchedState.url)) {
          const error = new Error('duplication');
          error.errors = 'duplication';
          throw error;
        }
      })
      .then(() => getXml(watchedState.url))
      .then((data) => {
        parseXml(data);
        watchedState.feedback = 'success';
        render();
      })
      .catch((err) => {
        watchedState.url = '';
        console.log(err.message);
        watchedState.feedback = err.errors;
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

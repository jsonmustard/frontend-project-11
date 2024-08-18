import i18next from 'i18next';
import _ from 'lodash';
import validate from './validation.js';
import ru from './locales/ru.js';
import watchedState from './watcher.js';

const app = () => {
  const inputUrlElement = document.getElementById('url-input');

  inputUrlElement.addEventListener('change', () => {
    watchedState.url = inputUrlElement.value;
  });

  const getXml = (url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.ok) return response.json();
      const error = new Error('networkError');
      error.errors = 'networkError';
      throw error;
    })
    .then((data) => data.contents);

  const parseXml = (xmlString) => {
    const parser = new DOMParser();
    const feedId = _.uniqueId();
    const parsedXml = parser.parseFromString(xmlString, 'text/xml');

    const isError = parsedXml.querySelector('parsererror');

    // if (isError) {
    //   const error = new Error('invalidRss');
    //   error.errors = 'invalidRss';
    //   throw error;
    // }

    const posts = Array.from(parsedXml.querySelectorAll('item'))
      .map((post) => ({
        id: _.uniqueId(),
        feedId,
        title: post.querySelector('title').textContent,
        description: post.querySelector('description').textContent,
        link: post.querySelector('link').textContent,
        pubDate: new Date(post.querySelector('pubDate').textContent),
      }));

    const pubDates = posts.map((post) => post.pubDate);

    const latestPubDate = Math.max(...pubDates);

    const feedTitle = parsedXml.querySelector('title').textContent;
    const feedDescription = parsedXml.querySelector('description').textContent;

    const feed = {
      id: feedId,
      url: watchedState.url,
      title: feedTitle,
      description: feedDescription,
      latestPubDate,
    };

    return {
      feed,
      posts,
    };
  };

  const handleUrl = (url) => getXml(url)
    .then((data) => {
      const parsedData = parseXml(data);

      const feedToUpdate = watchedState.feeds.find((feed) => feed.url === url);

      if (feedToUpdate) {
        const currentLatestPubDate = feedToUpdate.latestPubDate;
        feedToUpdate.latestPubDate = parsedData.feed.latestPubDate;

        const newPosts = parsedData.posts.filter((post) => post.pubDate > currentLatestPubDate);
        if (newPosts.length !== 0) {
          watchedState.posts.push(...newPosts);
        }
      } else {
        watchedState.feeds.push(parsedData.feed);
        watchedState.posts.push(...parsedData.posts);
      }

      watchedState.feedback = 'success';
      watchedState.url = '';
    });

  const render = () => {
    inputUrlElement.value = watchedState.url;
    inputUrlElement.focus();

    const fillFeedsContainer = () => {
      const feedsContainer = document.querySelector('.feeds');
      feedsContainer.innerHTML = '';

      const divCard = document.createElement('div');
      divCard.className = 'card border-0';
      feedsContainer.appendChild(divCard);

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
      watchedState.feeds.forEach((feed) => {
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
      postsContainer.innerHTML = '';

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

      watchedState.posts.forEach((post) => {
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
          const titleElement = document.querySelector('.modal-title');
          const bodyElement = document.querySelector('.modal-body');
          const linkElement = document.querySelector('.modal-footer > a');
          const { title, description, link } = watchedState.posts.find((i) => i.id === postId);
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

  const feedUpdater = () => {
    const promises = watchedState.feeds.map((feed) => handleUrl(feed.url));
    Promise.all(promises)
      .then(() => {
        if (watchedState.feeds.length !== 0) {
          render();
        }
      })
      .then(() => setTimeout(() => feedUpdater(), 5000));
  };

  setTimeout(() => feedUpdater(), 5000);

  const submitButtonElement = document.getElementById('submit-button');

  submitButtonElement.addEventListener('click', async (e) => {
    if (watchedState.url === '') {
      return;
    }

    e.preventDefault();

    inputUrlElement.setAttribute('disabled', '');
    submitButtonElement.setAttribute('disabled', '');

    validate(watchedState.url)
      .then(() => {
        if (watchedState.feeds.some((feed) => feed.url === watchedState.url)) {
          const error = new Error('duplication');
          error.errors = 'duplication';
          throw error;
        }
      })
      .then(() => handleUrl(watchedState.url))
      .then(() => render())
      // .catch((err) => {
      //   watchedState.feedback = err.errors;
      // })
      .finally(() => {
        inputUrlElement.removeAttribute('disabled');
        submitButtonElement.removeAttribute('disabled');
      });
  });
};

const runApp = () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  app();
};

export default runApp;

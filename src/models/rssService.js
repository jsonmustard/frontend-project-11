import parseXml from '../parser.js';
import state from './state.js';

const getXml = (url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(new Error('Failed to fetch data'));
  })
  .then((data) => data.contents)
  .catch(() => {
    const error = new Error('networkError');
    error.errors = 'networkError';
    throw error;
  });

const updateState = (data, url) => {
  const feedToUpdate = state.feeds.find((feed) => feed.url === url);

  if (feedToUpdate) {
    const currentLatestPubDate = feedToUpdate.latestPubDate;
    feedToUpdate.latestPubDate = data.feed.latestPubDate;

    const newPosts = data.posts.filter((post) => post.pubDate > currentLatestPubDate);
    if (newPosts.length !== 0) {
      state.posts.push(...newPosts);
    }
  } else {
    state.feeds.push(data.feed);
    state.posts.push(...data.posts);
    state.form.feedback = 'success';
    state.form.url = '';
  }
};

const handleUrl = (url) => getXml(url)
  .then((data) => parseXml(data))
  .then((data) => updateState(data, url));

export default handleUrl;

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

const handleUrl = (url) => getXml(url)
  .then((data) => {
    const parsedData = parseXml(data);

    const feedToUpdate = state.feeds.find((feed) => feed.url === url);

    if (feedToUpdate) {
      const currentLatestPubDate = feedToUpdate.latestPubDate;
      feedToUpdate.latestPubDate = parsedData.feed.latestPubDate;

      const newPosts = parsedData.posts.filter((post) => post.pubDate > currentLatestPubDate);
      if (newPosts.length !== 0) {
        state.posts.push(...newPosts);
      }
    } else {
      state.feeds.push(parsedData.feed);
      state.posts.push(...parsedData.posts);
      state.form.feedback = 'success';
      state.form.url = '';
    }
  });

export default handleUrl;

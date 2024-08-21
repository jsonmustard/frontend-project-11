import axios from 'axios';
import parseXml from '../parser.js';

const getXml = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => response.data.contents)
  .catch(() => {
    const error = new Error('');
    error.errors = 'networkError';
    throw error;
  });

const updateState = (parsedXml, url, watchedState) => {
  const feedToUpdate = watchedState.feeds.find((feed) => feed.url === url);

  if (feedToUpdate) {
    const currentLatestPubDate = feedToUpdate.latestPubDate;
    feedToUpdate.latestPubDate = parsedXml.feed.latestPubDate;

    const newPosts = parsedXml.posts.filter((post) => post.pubDate > currentLatestPubDate);
    if (newPosts.length !== 0) {
      watchedState.posts.push(...newPosts);
    }
  } else {
    watchedState.feeds.push(parsedXml.feed);
    watchedState.posts.push(...parsedXml.posts);
    watchedState.form.feedback = 'success';
    watchedState.form.url = '';
  }
};

const handleUrl = (url, watchedState) => getXml(url)
  .then((xmlString) => {
    const parsedXml = parseXml(xmlString, url);
    updateState(parsedXml, url, watchedState);
  });

export default handleUrl;

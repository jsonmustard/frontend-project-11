import _ from 'lodash';
import state from './models/state.js';

const parseXml = (xmlString) => {
  const parser = new DOMParser();
  const feedId = _.uniqueId();
  const parsedXml = parser.parseFromString(xmlString, 'text/xml');

  const isError = parsedXml.querySelector('parsererror');

  if (isError) {
    const error = new Error('invalidRss');
    error.errors = 'invalidRss';
    throw error;
  }

  const posts = Array.from(parsedXml.querySelectorAll('item'))
    .map((post) => ({
      id: _.uniqueId(),
      feedId,
      title: post.querySelector('title').textContent,
      description: post.querySelector('description').textContent,
      link: post.querySelector('link').textContent,
      pubDate: new Date(post.querySelector('pubDate').textContent),
      isRead: false,
    }));

  const pubDates = posts.map((post) => post.pubDate);

  const latestPubDate = Math.max(...pubDates);

  const feedTitle = parsedXml.querySelector('title').textContent;
  const feedDescription = parsedXml.querySelector('description').textContent;

  const feed = {
    id: feedId,
    url: state.form.url,
    title: feedTitle,
    description: feedDescription,
    latestPubDate,
  };

  return {
    feed,
    posts,
  };
};

export default parseXml;

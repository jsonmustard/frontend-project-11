import {
  object, string, setLocale,
} from 'yup';

export default (watchedState) => {
  setLocale({
    string: {
      url: 'invalidUrl',

    },
    mixed: {
      notOneOf: 'duplication',
    },
  });

  const userSchema = object({
    website: string().url().notOneOf(watchedState.feeds.map((feed) => feed.url)),
  });

  return userSchema.validate({ website: watchedState.form.url });
};

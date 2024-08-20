import {
  object, string, setLocale,
} from 'yup';

export default (url) => {
  setLocale({
    string: {
      url: 'invalidUrl',

    },
  });

  const userSchema = object({
    website: string().url(),
  });

  return userSchema.validate({ website: url });
};

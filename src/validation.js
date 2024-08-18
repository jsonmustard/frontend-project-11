import {
  object, string, setLocale,
} from 'yup';

setLocale({
  string: {
    url: 'invalidUrl',

  },
});

export default (url) => {
  const userSchema = object({
    website: string().url(),
  });

  return userSchema.validate({ website: url });
};

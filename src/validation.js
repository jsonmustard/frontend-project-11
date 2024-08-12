import {
  object, string, setLocale,
} from 'yup';

setLocale({
  string: {
    url: 'invalidUrl',
  },
});

export default async (url) => {
  const userSchema = object({
    website: string().url().nullable(),
  });

  const website = await userSchema.validate({ website: url });
  return website;
};

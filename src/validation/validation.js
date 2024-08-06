import {
  object, string, setLocale,
} from 'yup';

setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

export default async (url) => {
  const userSchema = object({
    website: string().url().nullable(),
  });

  const website = await userSchema.validate({ website: url });
  return website;
};

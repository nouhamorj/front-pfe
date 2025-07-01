import * as Yup from 'yup';

export const schema = Yup.object().shape({
  login: Yup.string()
    .trim()
    .required('Le login est requis'),
  pwd: Yup.string()
    .trim()
    .required('Le mot de passe est requis'),
});

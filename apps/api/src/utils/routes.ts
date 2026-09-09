export const getRedirectUrl = (path: string) => {
  // Detecta si la URL actual del navegador empieza con /qa o /prod
  const pathname = window.location.pathname;
  let prefix = '';

  if (pathname.startsWith('/qa')) {
    prefix = '/qa';
  } else if (pathname.startsWith('/prod')) {
    prefix = '/prod';
  }

  // Asegura que el path empiece con "/" y le antepone el prefijo correspondiente
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${cleanPath}`;
};

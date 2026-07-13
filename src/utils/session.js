export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');
  localStorage.removeItem('organizacion');
  localStorage.removeItem('organizacion_id');
  window.location.href = '/';
};
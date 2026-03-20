const AUTH_KEY = "travelzone_auth";

export const saveAuth = (data) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const getAuth = () => {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};

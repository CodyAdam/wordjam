export function setUsername(username:string) {
  localStorage.setItem('username', username);
}

export function getUsername() {
  return localStorage.getItem('username') ?? 'Unknown';
}
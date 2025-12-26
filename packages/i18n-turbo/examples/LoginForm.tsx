import React from 'react';
export function LoginForm() {
  return <form>
      <label>Username</label>
      <input type="text" />

      <label>password</label>
      <input type="password" />

      <button>Login</button>
    </form>;
}
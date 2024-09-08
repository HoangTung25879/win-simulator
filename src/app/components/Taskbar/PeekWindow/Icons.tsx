import { memo } from "react";

export const Pause = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 29.328V2.672h2.672v26.656H8zM21.328 2.672H24v26.656h-2.672V2.672z" />
  </svg>
));

export const Play = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 16 8 30V2z" />
  </svg>
));

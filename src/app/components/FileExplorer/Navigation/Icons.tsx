import { memo, useMemo } from "react";

export const BackIcon = memo(() => (
  <svg viewBox="-8 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 14v4H7.656l7.172 7.172L12 28 0 16 12 4l2.828 2.828L7.656 14H32z" />
  </svg>
));

export const ForwardIcon = memo(() => (
  <svg viewBox="8 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="m20 4 12 12-12 12-2.828-2.828L24.344 18H0v-4h24.344l-7.172-7.172L20 4z" />
  </svg>
));

export const RefreshIcon = memo(() => (
  <svg viewBox="-10 -13 52 52" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.266.594q2.594.703 4.75 2.195t3.711 3.531 2.414 4.516T32 16q0 2.203-.57 4.25t-1.609 3.828-2.5 3.242-3.242 2.5-3.828 1.609-4.25.57-4.25-.57-3.828-1.609-3.242-2.5-2.5-3.242-1.609-3.82T.002 16q0-2.188.578-4.25t1.648-3.883T4.83 4.554t3.453-2.555H4.002v-2h8v8h-2V3.358q-1.828.875-3.305 2.195T4.174 8.522t-1.609 3.555-.563 3.922q0 1.922.5 3.711t1.414 3.344 2.195 2.836 2.836 2.195 3.336 1.414 3.719.5q1.922 0 3.711-.5t3.344-1.414 2.836-2.195 2.195-2.836 1.414-3.336.5-3.719q0-2.344-.758-4.516T27.127 7.53t-3.242-3.086-4.148-1.93l.531-1.922z" />
  </svg>
));

type DownProps = { flip?: boolean };

export const DownIcon = memo<DownProps>(({ flip }) => {
  const style = useMemo(
    () =>
      flip ? { transform: "scaleY(-1)", transition: "all 0.2s" } : undefined,
    [flip],
  );

  return (
    <svg style={style} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="m28.109 5.453 3.781 3.766L15.999 25.11.108 9.219l3.781-3.766 12.109 12.109L28.107 5.453z" />
    </svg>
  );
});

export const UpIcon = memo(() => {
  const style = useMemo(() => ({ marginTop: "-1px" }), []);

  return (
    <svg style={style} viewBox="0 -7 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="m16 0 12 12-2.828 2.828L18 7.656V32h-4V7.656l-7.172 7.172L4 12 16 0z" />
    </svg>
  );
});

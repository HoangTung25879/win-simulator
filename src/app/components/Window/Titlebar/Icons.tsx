import { memo, SVGAttributes } from "react";

export const CLOSE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAAAMElEQVR4AWMgEoyC2TCAwsYPFqMCouzZCQPEOmzvnj0QRJTqo6iAgOoLMIDCHsYAACjTO7/gCQlBAAAAAElFTkSuQmCC";

export const MAXIMIZE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAR0lEQVR42u3IoRHAMAzFUO+/gllKG5IgD2DujX4vC8ikMO9ORHb9xN1FWWc8Q5R15jt1gs/22jrBZxGhE3yWmaKsU1Wi7EIfHneIsXEKuhAAAAAASUVORK5CYII=";

export const MAXIMIZE_DISABLED =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVR42mOgEhgFnp6e//Fh+hmALj5UDBj4QBwFANQKUXn4YyGJAAAAAElFTkSuQmCC";

export const MINIMIZE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIUlEQVR42mMYPGAUjIIDBw78x4cJGnDu3Ln/+DB+3aMAAPFzNUFuAVJEAAAAAElFTkSuQmCC";

export const MINIMIZE_DISABLED =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGElEQVR42mMYPGAUjAJPT8//+DCNDRgFAPTaHaFVv24VAAAAAElFTkSuQmCC";

export const RESTORE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAAAOklEQVR4AWMYVmA2BiBN/6JFi3DKrcUAEEGcGnZiAIggTg1HwQCNDSSpp+H8hQtoiECAXMcADMMbAABMtF75qvi0qwAAAABJRU5ErkJggg==";

export const RESTORE_DISABLED =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJElEQVR42mNABaPA09PzPzZMsaFk20x/A2D8gTIAE9Mp+kYBAJPzT5+OMe9rAAAAAElFTkSuQmCC";

export const MinimizeIcon = memo<SVGAttributes<SVGSVGElement>>(
  ({ fill, width }) => (
    <svg
      fill={fill}
      width={width}
      viewBox="0 0 10 1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h10v1H0z" />
    </svg>
  ),
);

export const MaximizeIcon = memo<SVGAttributes<SVGSVGElement>>(
  ({ fill, width }) => (
    <svg
      fill={fill}
      width={width}
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0v10h10V0H0zm1 1h8v8H1V1z" />
    </svg>
  ),
);

export const MaximizedIcon = memo<SVGAttributes<SVGSVGElement>>(
  ({ fill, width }) => (
    <svg
      fill={fill}
      width={width}
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.1 0v2H0v8.1h8.2v-2h2V0H2.1zm5.1 9.2H1.1V3h6.1v6.2zm2-2.1h-1V2H3.1V1h6.1v6.1z" />
    </svg>
  ),
);

export const CloseIcon = memo<SVGAttributes<SVGSVGElement>>(
  ({ fill, width }) => (
    <svg
      fill={fill}
      width={width}
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.2.7L9.5 0 5.1 4.4.7 0 0 .7l4.4 4.4L0 9.5l.7.7 4.4-4.4 4.4 4.4.7-.7-4.4-4.4z" />
    </svg>
  ),
);

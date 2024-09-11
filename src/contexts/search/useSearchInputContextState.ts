import { useRef, useState } from "react";

type SearchInputContextState = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  firstResultRef: React.MutableRefObject<lunr.Index.Result>;
};

const useSearchInputContextState = (): SearchInputContextState => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstResultRef = useRef<lunr.Index.Result>({} as lunr.Index.Result);
  return {
    value,
    setValue,
    inputRef,
    menuRef,
    firstResultRef,
  };
};

export default useSearchInputContextState;

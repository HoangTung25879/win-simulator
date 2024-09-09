import { useRef, useState } from "react";

type SearchInputContextState = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
};

const useSearchInputContextState = (): SearchInputContextState => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  return {
    value,
    setValue,
    inputRef,
    menuRef,
  };
};

export default useSearchInputContextState;

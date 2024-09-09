import { useState } from "react";

type SearchInputContextState = {
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const useSearchInputContextState = (): SearchInputContextState => {
  const [value, setValue] = useState("yoyoyo");

  return {
    value,
    setValue,
  };
};

export default useSearchInputContextState;

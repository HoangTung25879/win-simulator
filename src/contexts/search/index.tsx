import contextFactory from "../contextFactory";
import useSearchInputContextState from "./useSearchInputContextState";

const { Provider, useContext } = contextFactory(useSearchInputContextState);

export { Provider as SearchInputProvider, useContext as useSearchInput };

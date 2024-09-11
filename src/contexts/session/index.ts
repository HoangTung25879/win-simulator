import contextFactory from "../contextFactory";
import useSessionContextState from "./useSessionContextState";

const { Provider, useContext } = contextFactory(useSessionContextState);

export { Provider as SessionProvider, useContext as useSession };

import contextFactory from "../contextFactory";
import useProcessContextState from "./useProcessContextState";

const { Provider, useContext } = contextFactory(useProcessContextState);

export { Provider as ProcessProvider, useContext as useProcesses };

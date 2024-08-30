import { createContext, memo, useContext } from "react";

interface PropsWithChildren {
  children: React.ReactNode;
}

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.JSX.Element,
): {
  Provider: React.NamedExoticComponent<PropsWithChildren>;
  useContext: () => T;
} => {
  const Context = createContext(Object.create(null) as T);
  const Provider = memo<PropsWithChildren>(({ children }) => (
    <Context.Provider value={useContextState()}>
      {children}
      {ContextComponent}
    </Context.Provider>
  ));
  return {
    Provider,
    useContext: () => useContext(Context),
  };
};

export default contextFactory;

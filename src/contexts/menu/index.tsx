import Menu from "@/app/components/Menu/Menu";
import contextFactory from "../contextFactory";
import useMenuContextState from "./useMenuContextState";

const { Provider, useContext } = contextFactory(useMenuContextState, <Menu />);

export { Provider as MenuProvider, useContext as useMenu };

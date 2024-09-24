import Menu from "@/app/components/Common/Menu/Menu";
import contextFactory from "../contextFactory";
import useMenuContextState from "./useMenuContextState";

const { Provider, useContext } = contextFactory(useMenuContextState, <Menu />);

export { Provider as MenuProvider, useContext as useMenu };

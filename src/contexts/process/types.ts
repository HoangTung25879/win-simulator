export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

type BaseProcessArguments = {
  // allowResizing?: boolean;
  // autoSizing?: boolean;
  // backgroundColor?: string;
  // dependantLibs?: string[];
  // hideMaximizeButton?: boolean;
  // hideMinimizeButton?: boolean;
  // hideTaskbarEntry?: boolean;
  // hideTitlebar?: boolean;
  // hideTitlebarIcon?: boolean;
  // initialRelativePosition?: RelativePosition;
  // libs?: string[];
  // lockAspectRatio?: boolean;
  // url?: string;
};

export type ProcessArguments = BaseProcessArguments;

export type Process = ProcessArguments &
  ProcessElements & {
    // Component: React.ComponentType<ComponentProcessProps>;
    // closing?: boolean;
    // defaultSize?: Size;
    // dialogProcess?: boolean;
    // hasWindow?: boolean;
    icon: string;
    // maximized?: boolean;
    // minimized?: boolean;
    // preferProcessIcon?: boolean;
    // singleton?: boolean;
    // title: string;
  };

export type Processes = Record<string, Process>;

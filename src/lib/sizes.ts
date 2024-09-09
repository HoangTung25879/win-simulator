//* AI prompt: convert this to CSS Variables in a Global Stylesheet
const sizes = {
  calendar: {
    maxHeight: 357,
  },
  clock: {
    fontSize: "12px",
    padding: 5,
  },
  contextMenu: {
    subMenuOffsetX: -1,
    subMenuOffsetY: 4,
  },
  fileEntry: {
    fontSize: "12px",
    iconSize: "48px",
    maxIconTextDisplayWidth: 72,
    maxListTextDisplayWidth: 102,
    renamePadding: 5,
    renameWidth: 75,
  },
  fileExplorer: {
    navBarHeight: "38px",
    navInputHeight: 24,
    statusBarHeight: "23px",
  },
  fileManager: {
    columnGap: "1px",
    gridEntryHeight: "70px",
    gridEntryWidth: "74px",
    padding: "5px 0",
    rowGap: "28px",
  },
  search: {
    headerHeight: 52,
    inputHeight: 40,
    maxHeight: 415,
    size: 600,
  },
  startMenu: {
    maxHeight: 560,
    sideBar: {
      buttonHeight: 48,
      expandedWidth: 228,
      iconSize: "16px",
      width: 48,
    },
    size: 320,
  },
  taskbar: {
    height: 40,
    blur: "5px",
    search: {
      width: 288,
    },
    button: {
      iconSize: "15px",
      width: 48,
    },
    entry: {
      borderSize: "3px",
      fontSize: "12px",
      iconSize: "16px",
      maxWidth: "160px",
      peekControlsHeight: 36,
      peekImage: {
        height: 140,
        margin: 8,
      },
      peekMaxWidth: 200,
    },
    panelBlur: "12px",
  },
  titleBar: {
    buttonIconWidth: "10px",
    buttonWidth: "45px",
    fontSize: "12px",
    height: 30,
    iconMarginRight: "4px",
    iconSize: "16px",
  },
  window: {
    cascadeOffset: 26,
    outlineSize: "1px",
  },
};

export default sizes;

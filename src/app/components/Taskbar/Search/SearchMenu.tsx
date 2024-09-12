"use client";

import { useSearchInput } from "@/contexts/search";
import "./Search.scss";
import {
  FOCUSABLE_ELEMENT,
  MILLISECONDS_IN_SECOND,
  PICTURES_FOLDER,
  SHORTCUT_EXTENSION,
  TRANSITIONS_IN_SECONDS,
  VIDEOS_FOLDER,
} from "@/lib/constants";
import { haltEvent } from "@/lib/utils";
import { Documents, Pictures, Videos } from "../StartMenu/Sidebar/SidebarIcons";
import { useSession } from "@/contexts/session";
import { useFileSystem } from "@/contexts/fileSystem";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProcesses } from "@/contexts/process";
import lunr from "lunr";
import { useSearch } from "./useSearch";
import { ProcessArguments } from "@/contexts/process/types";
import { basename, extname } from "path";
import {
  getCachedShortcut,
  getShortcutInfo,
  isExistingFile,
} from "@/contexts/fileSystem/utils";
import { getProcessByFileExtension } from "../../Files/FileManager/functions";
import clsx from "clsx";
import { CloseIcon } from "../../Window/Titlebar/Icon";
import directory from "@/contexts/process/directory";
import Icon from "../../Icon/Icon";
import { GamesIcon } from "./Icons";
import ResultSection from "./ResultSection";
import ResultDetails from "./ResultDetails";
import { IDS_MENU } from "../Taskbar";

type SearchMenuProps = {
  toggleSearch: (showMenu?: boolean) => void;
};

const TABS = ["All", "Documents", "Photos", "Videos"] as const;

export type TabName = (typeof TABS)[number];

export const SEARCH_PARENT_CLASS = "list-result";

type TabData = {
  icon: React.JSX.Element;
  subtitle?: string;
  title: string;
};

export const NO_RESULTS = "NO_RESULTS";

const SUGGESTED = ["FileExplorer", "Terminal", "Messenger", "Browser", "Paint"];

const GAMES = ["SpaceCadet", "Quake3", "DXBall"];

const INITIAL_DATA = {
  Documents: {
    icon: <Documents />,
    subtitle: "for documents",
    title: "Documents",
  },
  Photos: {
    icon: <Pictures />,
    title: "Photos",
  },
  Videos: {
    icon: <Videos />,
    title: "Videos",
  },
} as Record<TabName, TabData>;

const SearchMenu = ({ toggleSearch }: SearchMenuProps) => {
  const {
    value: searchTerm,
    inputRef,
    menuRef,
    firstResultRef,
  } = useSearchInput();
  const { recentFiles, updateRecentFiles } = useSession();
  const { lstat, readFile } = useFileSystem();
  const { open } = useProcesses();
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const results = useSearch(searchTerm);
  const [bestMatch, setBestMatch] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [subResults, setSubResults] = useState<[string, lunr.Index.Result[]][]>(
    [],
  );

  const listRef = useRef<HTMLDivElement | null>(null);

  const firstResult = useMemo(
    () =>
      activeTab === "All"
        ? results[0]
        : Object.fromEntries(subResults)[activeTab]?.[0],
    [activeTab, results, subResults],
  );

  firstResultRef.current = firstResult;

  const changeTab = useCallback(
    (tab: TabName) => {
      if (inputRef.current) {
        inputRef.current.value = (
          tab === "All"
            ? inputRef.current.value
            : `${tab}: ${inputRef.current.value}`
        ).replace(`${activeTab}: `, "");
        listRef.current?.scrollTo(0, 0);
      }
      setActiveItem("");
      setActiveTab(tab);
    },
    [activeTab],
  );

  const openApp = useCallback(
    (pid: string, args?: ProcessArguments) => {
      toggleSearch(false);
      open(pid, args);
    },
    [open, toggleSearch],
  );

  useEffect(() => {
    if (
      firstResult?.ref &&
      (!bestMatch || bestMatch !== firstResult?.ref || !activeItem)
    ) {
      setBestMatch(firstResult.ref);
      if (menuRef.current) {
        setActiveItem(firstResult.ref);
      }
    } else if (!firstResult && activeItem) {
      setActiveItem("");
    }
  }, [activeItem, bestMatch, firstResult]);

  useEffect(() => {
    if (results.length > 0) {
      results
        .reduce(
          async (acc, result) => {
            const currentResults = await acc;
            const extension = extname(result.ref);
            let pid = "";
            if (extension === SHORTCUT_EXTENSION) {
              if (result.ref.startsWith(`${PICTURES_FOLDER}/`)) pid = "Photos";
              else if (result.ref.startsWith(`${VIDEOS_FOLDER}/`)) {
                pid = "VideoPlayer";
              } else {
                ({ pid } = isExistingFile(await lstat(result.ref))
                  ? getCachedShortcut(result.ref)
                  : getShortcutInfo(await readFile(result.ref)));
              }
            } else {
              pid = getProcessByFileExtension(extension);
            }

            if (pid === "Photos") {
              currentResults.Photos.push(result);
            } else if (pid === "VideoPlayer") {
              currentResults.Videos.push(result);
            } else {
              currentResults.Documents.push(result);
            }

            return currentResults;
          },
          Promise.resolve({
            Documents: [] as lunr.Index.Result[],
            Photos: [] as lunr.Index.Result[],
            Videos: [] as lunr.Index.Result[],
          }),
        )
        .then((newResults) => setSubResults(Object.entries(newResults)));
    } else {
      setSubResults([]);
    }
  }, [lstat, readFile, results]);

  return (
    <div
      id={IDS_MENU.searchMenu}
      ref={menuRef}
      className="search-menu"
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleSearch(false);
      }}
      onContextMenu={haltEvent}
      {...FOCUSABLE_ELEMENT}
    >
      <div className="search-content">
        <ol className="search-tabs">
          {TABS.map((tab) => (
            <li
              key={tab}
              className={clsx(tab === activeTab ? "--active" : undefined)}
              onClick={() => changeTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ol>
        <button className="close-button" onClick={() => toggleSearch(false)}>
          <CloseIcon />
        </button>
        {!searchTerm && activeTab === "All" && (
          <div className="all-tab">
            <section>
              <figure>
                <figcaption>Suggested</figcaption>
                <ol className="suggestions">
                  {SUGGESTED.map(
                    (app) =>
                      directory[app] && (
                        <li
                          key={app}
                          onClick={() => openApp(app)}
                          title={directory[app].title}
                        >
                          <figure>
                            <Icon
                              src={directory[app].icon}
                              displaySize={32}
                              imgSize={32}
                            />
                            <figcaption>{directory[app].title}</figcaption>
                          </figure>
                        </li>
                      ),
                  )}
                </ol>
              </figure>
            </section>
            <section>
              {recentFiles.length > 0 && (
                <figure className="recent-file">
                  <figcaption>Recent</figcaption>
                  <ol>
                    {recentFiles.map(([file, pid, title], index) => (
                      <li
                        key={`${file}${pid}`}
                        onClick={() => {
                          openApp(pid, { url: file });
                          //* Update recent files after close taskbar
                          if (index !== 0) {
                            setTimeout(
                              () => updateRecentFiles(file, pid, title),
                              TRANSITIONS_IN_SECONDS.TASKBAR_ITEM *
                                MILLISECONDS_IN_SECOND,
                            );
                          }
                        }}
                      >
                        <Icon
                          displaySize={16}
                          imgSize={16}
                          src={directory[pid]?.icon}
                        />
                        <h2>{title || basename(file, extname(file))}</h2>
                      </li>
                    ))}
                  </ol>
                </figure>
              )}
              <figure className="card">
                <figcaption>
                  <GamesIcon />
                  Games for you
                </figcaption>
                <ol>
                  {GAMES.map(
                    (game) =>
                      directory[game] && (
                        <li
                          key={game}
                          onClick={() => openApp(game)}
                          title={directory[game].title}
                        >
                          <Icon
                            displaySize={56}
                            imgSize={96}
                            src={directory[game].icon}
                          />
                          <h4>{directory[game].title}</h4>
                        </li>
                      ),
                  )}
                </ol>
              </figure>
            </section>
          </div>
        )}
        {!searchTerm && activeTab !== "All" && (
          <div className="other-tab">
            {INITIAL_DATA[activeTab].icon}
            <h1>Search {INITIAL_DATA[activeTab].title.toLowerCase()}</h1>
            <h3>
              Start typing to search{" "}
              {INITIAL_DATA[activeTab].subtitle ||
                INITIAL_DATA[activeTab].title.toLowerCase()}
            </h3>
          </div>
        )}
        {searchTerm && (
          <div className="search-results">
            <div ref={listRef} className={SEARCH_PARENT_CLASS}>
              <ResultSection
                activeItem={activeItem}
                activeTab={activeTab}
                openApp={openApp}
                results={[firstResult || { ref: NO_RESULTS }]}
                searchTerm={searchTerm}
                setActiveItem={setActiveItem}
                title={"Best match" as TabName}
                details
              />
              {results.length > 1 &&
                subResults.map(
                  ([title, subResult]) =>
                    (activeTab === "All" || activeTab === title) && (
                      <ResultSection
                        key={title}
                        activeItem={activeItem}
                        activeTab={activeTab}
                        changeTab={changeTab}
                        openApp={openApp}
                        results={subResult.filter(
                          (result) => firstResult !== result,
                        )}
                        searchTerm={searchTerm}
                        setActiveItem={setActiveItem}
                        title={title as TabName}
                      />
                    ),
                )}
            </div>
            {activeItem && firstResult && (
              <ResultDetails
                openApp={openApp}
                setActiveItem={setActiveItem}
                url={activeItem || firstResult?.ref}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMenu;

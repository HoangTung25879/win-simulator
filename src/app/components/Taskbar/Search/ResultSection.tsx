"use client";

import { ProcessArguments } from "@/contexts/process/types";
import { NO_RESULTS, TabName } from "./SearchPanel";
import { useMemo } from "react";
import clsx from "clsx";
import { SearchIcon } from "../../FileExplorer/Icons";
import Result from "./Result";

type ResultSectionProps = {
  activeItem: string;
  activeTab: TabName;
  changeTab?: (tab: TabName) => void;
  details?: boolean;
  openApp: (pid: string, args?: ProcessArguments) => void;
  results: lunr.Index.Result[];
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  title: TabName;
};

const ResultSection = ({
  activeTab,
  activeItem,
  details,
  openApp,
  results,
  searchTerm,
  setActiveItem,
  changeTab,
  title,
}: ResultSectionProps) => {
  const noResults = useMemo(
    () => results.length === 1 && results[0].ref === NO_RESULTS,
    [results],
  );

  return results.length === 0 ? null : (
    <figure>
      <figcaption
        className={clsx(
          "result-header",
          activeTab === title || (title as string) === "Best match"
            ? "--disabled"
            : undefined,
        )}
        onClick={() => changeTab?.(title)}
      >
        {title}
      </figcaption>
      <ol>
        {noResults ? (
          <li className="no-results">
            <SearchIcon />
            No results found for &apos;{searchTerm}&apos;
          </li>
        ) : (
          results.map(({ ref }) => (
            <Result
              key={ref}
              active={activeItem === ref}
              details={details}
              openApp={openApp}
              searchTerm={searchTerm}
              setActiveItem={setActiveItem}
              url={ref}
            />
          ))
        )}
      </ol>
    </figure>
  );
};

export default ResultSection;

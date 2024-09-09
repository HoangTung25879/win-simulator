import { useFileSystem } from "@/contexts/fileSystem";
import { RootFileSystem } from "@/contexts/fileSystem/useAsyncFs";
import { getExtension } from "@/lib/utils";
import IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import { Index, Builder } from "lunr";
import { useEffect, useState } from "react";
import SEARCH_EXTENSIONS from "../../../../../scripts/searchExtensions.json";
import { basename, extname } from "path";

export const FILE_INDEX = "/.index/search.lunr.json";

let baseIndex = Object.create(null) as Index;
let basePaths = [] as string[];

type ResponseIndex = Index & {
  paths: string[];
};

const search = async (
  searchTerm: string,
  index?: Index,
): Promise<Index.Result[]> => {
  if (!index && !baseIndex?.search) {
    const response = await fetch(FILE_INDEX, { priority: "high" });
    try {
      const { paths, ...responseIndex } = JSON.parse(
        await response.text(),
      ) as ResponseIndex;

      baseIndex = Index.load(responseIndex);
      basePaths = paths;
    } catch (error) {
      // Failed to parse text data to JSON
      console.error(error);
    }
  }
  const searchIndex = index ?? baseIndex;
  let results: Index.Result[] = [];
  const normalizedSearchTerm = searchTerm
    .trim()
    .replace(/\./g, " ")
    .replace(/\*~\^-\+/g, "");
  try {
    results = searchIndex.search?.(normalizedSearchTerm);
    if (results?.length === 0) {
      results = searchIndex.search?.(
        `${normalizedSearchTerm.split(" ").join("* ")}*`,
      );
    }
  } catch (error) {
    // Ignore search errors
    console.error(error);
  }
  if (results) {
    return results.map((result) => ({
      ...result,
      ref:
        (Object.prototype.hasOwnProperty.call(basePaths, result.ref)
          ? (basePaths[result.ref as keyof typeof basePaths] as string)
          : result.ref) || "",
    }));
  }
  return [];
};

interface IWritableFs extends Omit<IndexedDBFileSystem, "_cache"> {
  _cache: {
    map: Map<string, unknown>;
  };
}

const buildDynamicIndex = async (
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem,
): Promise<Index> => {
  const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
  const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
  const writable = overlayedFileSystems?.writable as IWritableFs;
  const writableFiles =
    (typeof writable?._cache?.map?.keys === "function" && [
      ...writable._cache.map.keys(),
    ]) ||
    Object.keys(
      (writable?._cache?.map as unknown as Record<string, unknown>) || {},
    ) ||
    [];
  const filesToIndex = writableFiles.filter((path) => {
    const ext = getExtension(path);
    return Boolean(ext) && !SEARCH_EXTENSIONS.ignore.includes(ext);
  });
  const indexedFiles = await Promise.all(
    filesToIndex.map(async (path) => {
      const name = basename(path, extname(path));
      return {
        name,
        path,
        text: SEARCH_EXTENSIONS.index.includes(getExtension(path))
          ? `${name} ${(await readFile(path)).toString()}`
          : name,
      };
    }),
  );

  const builder = new Builder();
  builder.ref("path");
  builder.field("name");
  builder.field("text");
  indexedFiles.forEach((doc) => builder.add(doc));
  const dynamicIndex = builder.build();

  return Index.load(dynamicIndex.toJSON());
};

export const useSearch = (searchTerm: string): Index.Result[] => {
  const [results, setResults] = useState([] as Index.Result[]);
  const { readFile, rootFs } = useFileSystem();

  useEffect(() => {
    const updateResults = async (): Promise<void> => {
      if (searchTerm.length > 0) {
        search(searchTerm).then(setResults);
        buildDynamicIndex(readFile, rootFs).then((dynamicIndex) =>
          search(searchTerm, dynamicIndex).then((searchResults) =>
            setResults((currentResults) =>
              [...currentResults, ...searchResults].sort(
                (a, b) => b.score - a.score,
              ),
            ),
          ),
        );
      } else {
        setResults([]);
      }
    };
    updateResults();
  }, [readFile, rootFs, searchTerm]);

  return results;
};

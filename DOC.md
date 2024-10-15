# Project Documentation

## Public folder:

Simulate folder system of OS

## Scripts:

### fs2json.js

This script reads a directory structure, optionally excludes specified paths, and writes the structure along with file sizes and modification times to a JSON file. [name,size,modifiedTime]

## Context Provider:

### FileSystemProvider:

#### Overview

Provides a comprehensive set of functionalities to interact with a file system. It leverages the `useAsyncFs` hook and integrates with the BrowserFS library to handle various file system operations.

#### Functions

`updatePasteEntries`
Updates the pasteList state with the given entries and operation.

`copyToClipboard`
Copies a file to the clipboard if its extension is supported.

`copyEntries`
Copies the given entries to the clipboard and updates the pasteList.

`moveEntries`
Moves the given entries and updates the pasteList.

`addFsWatcher`
Adds a file system watcher for the specified folder.

`cleanupUnusedMounts`
Cleans up unused mounts by checking if they are being watched.

`removeFsWatcher`
Removes a file system watcher for the specified folder and schedules a cleanup of unused mounts.

`updateFolder`
Updates the specified folder by calling the updateFiles functions of its watchers.

`mountEmscriptenFs`
Mounts an Emscripten file system.

`mapFs`
Maps a file system directory handle to a specified directory.

`mountFs`
Mounts a file system from a URL (ISO or ZIP).

`unMountFs`
Unmounts a file system from a URL.

`unMapFs`
Unmaps a file system directory and removes its handle.

`addFile`
Prompts the user to select files and adds them to the specified directory.

`mkdirRecursive`
Creates a directory and all its parent directories recursively.

`deletePath`
Deletes a file or directory and its contents recursively.

`createPath`
Creates a file or directory with a unique name in the specified directory.

### SessionProvider:

#### Overview

Manages the state of a session context. The session context includes various states such as window states, icon positions, recent files, and more.

#### Functions

`updateRecentFiles`: Updates the list of recent files.

`prependToStack`: Prepends a window ID to the stack order.

`removeFromStack`: Removes a window ID from the stack order.

`setSortOrder`: Sets the sort order for a directory.

`setAndUpdateIconPositions`: Sets and updates icon positions, especially for the desktop.

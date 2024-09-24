"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import { useProcesses } from "@/contexts/process";
import { ROOT_NAME } from "@/lib/constants";
import { basename } from "path";
import { forwardRef, useEffect, useState } from "react";
import Icon from "../../Common/Icon/Icon";
import useAddressBarContextMenu from "../useAddressBarContextMenu";
import { RefreshIcon } from "./Icons";

type AddressBarProps = {
  id: string;
};

const AddressBar = forwardRef<HTMLInputElement, AddressBarProps>(
  ({ id }, ref) => {
    const inputRef = ref as React.MutableRefObject<HTMLInputElement | null>;
    const {
      url: changeUrl,
      processes: {
        [id]: { icon, url = "" },
      },
    } = useProcesses();
    const { exists, updateFolder } = useFileSystem();
    const displayName = basename(url) || ROOT_NAME;
    const [addressBar, setAddressBar] = useState(displayName);

    useEffect(() => {
      if (inputRef.current) {
        if (addressBar === url) {
          inputRef.current.select();
        } else if (addressBar === displayName) {
          window.getSelection()?.removeAllRanges();
        } else if (document.activeElement !== inputRef.current) {
          setAddressBar(displayName);
        }
      }
    }, [addressBar, displayName, url]);
    return (
      <div className="address-bar">
        <Icon alt={displayName} imgSize={16} src={icon} />
        <input
          ref={inputRef}
          aria-label="Address"
          enterKeyHint="go"
          onBlurCapture={() => setAddressBar(displayName)}
          onChange={({ target }) => setAddressBar(target.value)}
          onFocusCapture={() => setAddressBar(url)}
          onKeyDown={async ({ key }) => {
            if (key === "Enter" && inputRef.current) {
              const { value } = inputRef.current;
              if (value && (await exists(value))) changeUrl(id, value);
              inputRef.current.blur();
            }
          }}
          spellCheck={false}
          type="text"
          value={addressBar}
          {...useAddressBarContextMenu(url)}
        />
        <button
          className="refresh"
          onClick={() => updateFolder(url)}
          title={`Refresh "${displayName}" (F5)`}
        >
          <RefreshIcon />
        </button>
      </div>
    );
  },
);

export default AddressBar;

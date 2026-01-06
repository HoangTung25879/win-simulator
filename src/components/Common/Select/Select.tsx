"use client";

import { useSelect } from "downshift";
import { DownIcon } from "../../Taskbar/Calendar/Icons";
import clsx from "clsx";
import "./Select.scss";
import { useLayoutEffect, useRef, useState } from "react";

export type SelectItem = {
  id: string;
  label: string;
  value: string;
};
type SelectProps = {
  options: SelectItem[];
  value?: SelectItem;
  title: string;
  placeholder?: string;
  scrollContainer?: HTMLDivElement | null;
  onChange: (value: any) => void;
  optionFormatter?: (option: SelectItem) => string;
  valueFormatter?: (value: string) => string;
};

const selectPlaceholder = "Select something";
const Select = ({
  options,
  title,
  placeholder,
  scrollContainer,
  onChange,
  value,
  optionFormatter,
  valueFormatter,
}: SelectProps) => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: options,
    defaultSelectedItem: options[1],
    selectedItem: value,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) =>
      onChange(newSelectedItem),
  });
  const [offset, setOffset] = useState(0);
  const menuRef = useRef<HTMLUListElement | null>(null);
  useLayoutEffect(() => {
    if (isOpen) {
      const itemIndex = selectedItem
        ? options.findIndex((item) => item.id === selectedItem.id)
        : 0;
      const menuPaddingTop = 6;
      const menuItemHeight = 32;
      const gapBetweenMenuItem = 3;
      const inputHeight = 32;
      let newOffset =
        0 -
        menuPaddingTop -
        inputHeight -
        itemIndex * (menuItemHeight + gapBetweenMenuItem);
      // const menuHeight =
      //   menuPaddingTop * 2 +
      //   options.length * menuItemHeight +
      //   gapBetweenMenuItem * (options.length - 1);
      if (scrollContainer && menuRef.current) {
        const scrollRect = scrollContainer.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const menuBottomAdjust = menuRect.bottom + newOffset;
        const isMenuOutOfBounds = menuBottomAdjust > scrollRect.bottom;
        if (isMenuOutOfBounds) {
          const diffHeight = menuBottomAdjust - scrollRect.bottom + 12; // paddingBottom
          const itemsFillDiffHeight = Math.ceil(
            diffHeight / (menuItemHeight + gapBetweenMenuItem),
          );
          newOffset -=
            itemsFillDiffHeight * (menuItemHeight + gapBetweenMenuItem);
        }
        setOffset(newOffset);
      }
    } else {
      setOffset(0);
    }
  }, [selectedItem, isOpen, scrollContainer]);
  const selectedValue = selectedItem
    ? selectedItem.value
    : placeholder || selectPlaceholder;
  return (
    <div className="select-wrapper">
      <div className="select-downshift">
        <label {...getLabelProps()}>{title}</label>
        <div className="select-input" {...getToggleButtonProps()}>
          <span>
            {valueFormatter ? valueFormatter(selectedValue) : selectedValue}
          </span>
          <DownIcon />
        </div>
      </div>
      <ul
        style={{
          translate: `0px ${offset}px`,
        }}
        className={clsx("select-menu", !isOpen && "!invisible")}
        {...getMenuProps({ ref: menuRef })}
      >
        {isOpen &&
          options.map((item, index) => (
            <li
              className={clsx(selectedItem === item && "--selected")}
              key={item.id}
              {...getItemProps({ item, index })}
            >
              <span>
                {optionFormatter ? optionFormatter(item) : item.label}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Select;

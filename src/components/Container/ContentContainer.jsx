import React from "react";

const ContentContainer = ({
  className,
  justify,
  items,
  centered,
  row,
  children,
}) => {
  const primaryDimensions = "h-[full] w-full";
  const center = "justify-center items-center";
  const backgroundColor = "bg-white ";
  const textColor = "text-black";
  const defaultPadding = "p-[1rem]";
  const flexOption = row ? "flex-row" : "flex-col";
  return (
    <div
      className={`${className} ${primaryDimensions} ${defaultPadding} ${backgroundColor} ${textColor} flex ${flexOption} ${centered ? center : `justify-${justify} items-${items}`} overflow-auto `}>
      {children}
    </div>
  );
};

export default ContentContainer;

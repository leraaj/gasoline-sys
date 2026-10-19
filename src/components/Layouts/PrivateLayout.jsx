import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Ambulance,
  Icon,
  ListSortDescending,
  Menu,
  Motorbike,
} from "lucide-react";

const PrivateLayout = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const handleToggle = () => {
    return setToggle(!toggle);
  };
  const sidebarList = [
    {
      name: "Marra",
      icon: <Motorbike />,
      link: "",
    },
    {
      name: "Ambulance",
      icon: <Ambulance />,
      link: "",
    },
  ];
  return (
    <div
      className={`flex flex-col h-dvh w-[100%] overflow-hidden
          `}>
      <nav className={`h-[60px] bg-gray-400 text-white p-4`}>
        <div className={`flex flex-row justify-start items-center`}>
          <Button variant="light" size="sm" onClick={handleToggle}>
            {toggle ? <Menu /> : <ListSortDescending />}
          </Button>
        </div>
      </nav>
      <div className={`flex flex-row h-[calc(100%-60px-30px)] w-full`}>
        <aside
          className={`h-[100%] ${toggle ? "w-[250px]" : "w-[70px]"} flex flex-col bg-gray-200 p-2 px-4 transition-[width] duration-300 ease-in-out `}>
          {sidebarList.map((item, index) => {
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start">
                <span className="w-auto flex justify-start items-center gap-2">
                  {item.icon}
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                      toggle ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                    }`}>
                    {item.name}
                  </span>
                </span>
              </Button>
            );
          })}
        </aside>
        <content className={`h-full w-[100%] overflow-auto p-2 `}>
          <Outlet />
        </content>
      </div>
      <footer className={`h-[30px] bg-gray-400 text-white p-2 text-center`}>
        footer
      </footer>
    </div>
  );
};

export default PrivateLayout;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const cards = [
    { label: "Entries", value: "1" },
    { label: "Entries", value: "2" },
  ];
  return (
    <div className="w-[100%] p-4">
      <div className="flex flex-row start items-center gap-4 ">
        <span>{location.pathname}</span>
        {cards.map((item, index) => {
          return (
            <div
              index={index}
              className="h-[80px] w-[200px] border rounded-[1rem] flex justify-start items-center p-4 relative">
              <Badge className={`absolute -right-2 -top-2`}>{item.value}</Badge>
              <span className="font-medium uppercase">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

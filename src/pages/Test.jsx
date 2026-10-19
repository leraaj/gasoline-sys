import ContentContainer from "@/components/Container/ContentContainer";
import { DataTable } from "@/components/tables/data-table";
import { liquidationPrintviewColumns } from "@/components/tables/liquidation-printview/liquidation-printview-columns";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const Test = () => {
  const liquidationHistory = {
    label: "AMBULANCE",
    startDate: "10/1/2026",
    endDate: "10/15/2026",
  };
  const { state } = useLocation();
  const { printData } = state || {};
  useEffect(() => {
    console.log(printData);
  }, [printData]);
  const columns = useMemo(() => liquidationPrintviewColumns(), []);
  return (
    <div className="w-full h-dvh border border-red-600">
      <span className="w-full flex justify-start  border p-[1rem]">
        Print View
      </span>
      <span className="w-full flex justify-center  border p-[1rem] font-medium">
        {liquidationHistory.label} -{" "}
        {`${liquidationHistory.startDate} - ${liquidationHistory.endDate}`}
      </span>
      <ContentContainer>
        <DataTable
          data={printData?.data}
          columns={columns}
          noColumnFilter
          noSearchFilter
        />
      </ContentContainer>
    </div>
  );
};

export default Test;

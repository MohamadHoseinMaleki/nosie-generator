import { Outlet, useLocation } from "react-router-dom";
import Header from "./header";
import Sidebar from "./sidebar";
import DeviceStatus from "@renderer/components/widget/device-status";
import Frequency from "../widget/frequency";
import SelectMode from "../widget/select-mode";
import AnalyticsReport from "../widget/analytics-report";

const Layout = (): JSX.Element => {
  const location = useLocation();
  type PageType = "single" | "multi" | "sweep" | "barrage" | "filtered" | "doppler" | "default";

  // تعیین `pageType` بر اساس `pathname`
  const getPageType = (pathname: string): PageType => {
    switch (pathname) {
      case "/single-tone":
        return "single";
      case "/multi-tone":
        return "multi";
      case "/sweep":
        return "sweep";
      case "/barrage":
        return "barrage";
      case "/filtered-noise":
        return "filtered";
      case "/delay-doppler":
        return "doppler";
      default:
        return "default";
    }
  };

  const pageType = getPageType(location.pathname);

  return (
    <div className="flex">
      <Header />
      <Sidebar />
      <div className="h-screen max-h-screen w-full space-y-5 overflow-y-auto p-5">
        <h1 className="text-3xl font-bold"> Settings</h1>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <Frequency />
          <SelectMode />
        </div>
        <Outlet />
        <AnalyticsReport pageType={pageType} />
      </div>
      <DeviceStatus />
    </div>
  );
};
export default Layout;

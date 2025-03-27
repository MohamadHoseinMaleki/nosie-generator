import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "@renderer/components/layout";
import BarragePage from "@renderer/pages/barrage";
import DelayDopplerPage from "@renderer/pages/delay-doppler";
import FilteredNoisePage from "@renderer/pages/filtered-noise";
import MultiTonePage from "@renderer/pages/multi-tone";
import SinglePage from "@renderer/pages/single-tone";
import SweepPage from "@renderer/pages/sweep";

const Router = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/single-tone" />} />
      <Route element={<Layout />}>
        <Route path="/single-tone" element={<SinglePage />} />
        <Route path="/multi-tone" element={<MultiTonePage />} />
        <Route path="/sweep" element={<SweepPage />} />
        <Route path="/barrage" element={<BarragePage />} />
        <Route path="/filtered-noise" element={<FilteredNoisePage />} />
        <Route path="/delay-doppler" element={<DelayDopplerPage />} />
      </Route>
    </Routes>
  );
};
export default Router;

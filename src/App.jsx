import { Route, Routes } from "react-router-dom";
import LiquidationHistory from "./pages/LiquidationHistory";
import LiquidationRecord from "./pages/LiquidationRecord";
import Test from "./pages/Test";

function App() {
  return (
    <Routes>
      {/* <Route element={<PrivateLayout />}>
        <Route path="/" element={<Dashboard />} />
      </Route> */}
      {/* <Route path="/" element={<MainPage />} /> */}

      {/* Lists all the records of Gas liquidations */}
      <Route element={<LiquidationHistory />} path="/liquidation-history" />
      <Route element={<LiquidationRecord />} path="/liquidation-record/:id" />
      {/* <Route element={<Test />} path="/" /> */}
      <Route
        path="*"
        element={<Navigate to="/liquidation-history" replace />}
      />
    </Routes>
  );
}

export default App;

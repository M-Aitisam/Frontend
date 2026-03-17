import { Routes, Route, Navigate } from "react-router-dom";



import SitePage from "./page/SitePage";
import RulePage from "./page/RulePage";
import RuleBuilderPage from "./page/RuleBuilderPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SitePage />} />
      <Route path="/sites" element={<SitePage />} />
      <Route path="/sites/:siteId/devices" element={<RulePage />} />
      <Route path="/sites/:siteId/generate-rule" element={<RuleBuilderPage />} />
      <Route path="/sites/:siteId/generate-rule/:ruleId" element={<RuleBuilderPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

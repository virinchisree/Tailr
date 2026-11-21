import { Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components";
import { LandingPage } from "./features/landing/LandingPage";
import { CheckPage } from "./features/check/CheckPage";
import { ResultsPage } from "./features/results/ResultsPage";

function app() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          next: <Route path="/check" element={<CheckPage />} />
          then: <Route path="/results/:checkId" element={<ResultsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default app;
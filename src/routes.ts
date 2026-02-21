import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { SubjectLibrary } from "./components/SubjectLibrary";
import { VettingCenter } from "./components/VettingCenter";
import { Reports } from "./components/Reports";
import { SubjectDetail } from "./components/SubjectDetail";
import { GenerateExam } from "./components/GenerateExam";
import { CreateRubric } from "./components/CreateRubric";
import { Settings } from "./components/Settings";
import { Notifications } from "./components/Notifications";
import { Achievements } from "./components/Achievements";
import { Streak } from "./components/Streak";
import { TodaysGoals } from "./components/TodaysGoals";
import { Layout } from "./components/Layout";
import { AIPromptPage } from "./components/AIPromptPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "subjects", Component: SubjectLibrary },
      { path: "subjects/:id", Component: SubjectDetail },
      { path: "generate", Component: GenerateExam },
      { path: "create-rubric", Component: CreateRubric },
      { path: "vetting", Component: VettingCenter },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
      { path: "notifications", Component: Notifications },
      { path: "achievements", Component: Achievements },
      { path: "streak", Component: Streak },
      { path: "goals", Component: TodaysGoals },
      { path: "ai-prompt", Component: AIPromptPage },
    ],
  },
]);
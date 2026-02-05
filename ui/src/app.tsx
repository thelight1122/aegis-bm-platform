import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import BuildMastersPage from "./modules/buildmasters/BuildMastersPage";
import TrainingDepotPage from "./modules/training/TrainingDepotPage";
import DeployDepotPage from "./modules/deploy/DeployDepotPage";
import MirrorPage from "./modules/mirror/MirrorPage";
import ProjectsPage from "./modules/projects/ProjectsPage";
import TeamsPage from "./modules/teams/TeamsPage";
import TasksPage from "./modules/tasks/TasksPage";
import RunsPage from "./modules/runs/RunsPage";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/buildmasters" replace />} />
                <Route path="/buildmasters" element={<BuildMastersPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/runs" element={<RunsPage />} />
                <Route path="/training" element={<TrainingDepotPage />} />
                <Route path="/deploy" element={<DeployDepotPage />} />
                <Route path="/mirror" element={<MirrorPage />} />
                <Route path="*" element={<Navigate to="/buildmasters" replace />} />
            </Routes>
        </Layout>
    );
}


import { NavLink } from "react-router-dom";

export default function Nav() {
    return (
        <div className="tabs">
            <NavLink
                to="/buildmasters"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Build Masters
            </NavLink>
            <NavLink
                to="/projects"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Projects
            </NavLink>
            <NavLink
                to="/teams"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Teams
            </NavLink>
            <NavLink
                to="/tasks"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Tasks
            </NavLink>
            <NavLink
                to="/runs"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Runs
            </NavLink>
            <NavLink
                to="/training"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Training
            </NavLink>
            <NavLink
                to="/deploy"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Deploy
            </NavLink>
            <NavLink
                to="/mirror"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Mirror
            </NavLink>
        </div>
    );
}

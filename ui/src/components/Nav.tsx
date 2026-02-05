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
                to="/training"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Training Depot
            </NavLink>
            <NavLink
                to="/deploy"
                className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
                Deploy Depot
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

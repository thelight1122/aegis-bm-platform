import type { ReactNode } from "react";

export default function Section({
    title,
    subtitle,
    children
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <div className="card">
            <div className="h2">{title}</div>
            {subtitle ? <div className="p">{subtitle}</div> : null}
            <div className="spacer-12" />
            {children}
        </div>
    );
}

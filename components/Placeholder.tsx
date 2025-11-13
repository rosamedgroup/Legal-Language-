import React from 'react';

interface PlaceholderProps {
    type: 'empty' | 'error';
    title: string;
    message: React.ReactNode;
}

const EmptyStateIcon = () => (
    <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-tertiary))]" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M10 10v.01" />
        <path d="M14 14v.01" />
        <path d="M4 18h16" />
        <path d="M5 18v-12a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v12" />
        <path d="M14 10v.01" />
        <path d="M10 14v.01" />
        <path d="M3 3l18 18" />
    </svg>
);


const ErrorStateIcon = () => (
    <svg className="mx-auto h-16 w-16 text-red-400 dark:text-red-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 9v4" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
        <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
    </svg>
);

const icons = {
    empty: <EmptyStateIcon />,
    error: <ErrorStateIcon />,
};

const Placeholder: React.FC<PlaceholderProps> = ({ type, title, message }) => {
    return (
        <div className="text-center py-12 px-6 bg-[rgb(var(--background-primary))] rounded-lg">
            <div className="mb-4">
                {icons[type]}
            </div>
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">{title}</h3>
            <p className="text-[rgb(var(--text-secondary))]">{message}</p>
        </div>
    );
};

export default Placeholder;
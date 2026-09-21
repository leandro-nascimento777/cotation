interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = "Carregando…", className = "py-24" }: LoadingStateProps) => (
  <div className={`flex h-full items-center justify-center text-sm text-slate-400 ${className}`}>
    {message}
  </div>
);

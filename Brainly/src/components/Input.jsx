export const Input = ({ label, error, className = "", ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
                    w-full px-4 py-2.5 rounded-xl border border-slate-200 
                    bg-white text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:border-[#5046e4] focus:ring-2 focus:ring-[#5046e4]/10 
                    transition-all duration-200
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

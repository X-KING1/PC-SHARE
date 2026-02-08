// TuneCasa Component - LoadingSpinner
// Reusable loading spinner component

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    }

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 border-purple-500`}></div>
            {message && <p className="mt-4 text-gray-400">{message}</p>}
        </div>
    )
}

export default LoadingSpinner

export default function GoogleSignInButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 font-medium text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      aria-label="Sign in with Google"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_40)">
          <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.6C36.9 32.1 34.7 34.5 31.7 36.1V42H39.3C44 38.1 47.5 32 47.5 24.5Z" fill="#4285F4"/>
          <path d="M24 48C30.6 48 36.1 45.9 39.3 42L31.7 36.1C29.9 37.2 27.7 37.9 24 37.9C17.7 37.9 12.2 33.7 10.4 28.1H2.5V34.2C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
          <path d="M10.4 28.1C9.9 26.9 9.6 25.6 9.6 24C9.6 22.4 9.9 21.1 10.4 19.9V13.8H2.5C0.8 17.1 0 20.4 0 24C0 27.6 0.8 30.9 2.5 34.2L10.4 28.1Z" fill="#FBBC05"/>
          <path d="M24 9.5C27.7 9.5 30.5 10.8 32.3 12.5L39.4 5.4C36.1 2.3 30.6 0 24 0C14.1 0 5.7 6.9 2.5 13.8L10.4 19.9C12.2 14.3 17.7 9.5 24 9.5Z" fill="#EA4335"/>
        </g>
        <defs>
          <clipPath id="clip0_17_40">
            <rect width="48" height="48" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}

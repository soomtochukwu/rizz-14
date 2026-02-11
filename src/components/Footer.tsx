export function Footer() {
    return (
        <footer className="w-full text-center py-6 mt-8 relative z-10 overflow-hidden">
            <a
                href="https://github.com/soomtochukwu/rizz-14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 md:text-black md:bg-yellow-400 md:border-2 md:border-black md:px-4 md:py-2 md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:transition-all md:shadow-[4px_4px_0px_#000]"
                style={{ fontFamily: "Bangers, cursive" }}
            >
                <span>📂 View Source on GitHub</span>
            </a>
            <p className="mt-4 text-xs font-mono text-gray-500">
                Built with ❤️ (and 0 memory safety)
            </p>
        </footer>
    );
}

export function Footer() {
    return (
        <footer className="w-full text-center py-2 shrink-0 relative z-10">
            <a
                href="https://github.com/soomtochukwu/rizz-14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 md:text-black md:bg-yellow-400 md:border-2 md:border-black md:px-3 md:py-1.5 md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:transition-all md:shadow-[3px_3px_0px_#000]"
                style={{ fontFamily: "Bangers, cursive" }}
            >
                <span>📂 GitHub</span>
            </a>
            <p className="mt-1 text-[10px] font-mono text-gray-400 hidden md:block">
                Built with ❤️ (and 0 memory safety)
            </p>
        </footer>
    );
}

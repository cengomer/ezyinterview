import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-gray-700 mt-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-6 gap-2 text-sm">
        <div className="text-gray-500">&copy; {new Date().getFullYear()} InterviewAI</div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

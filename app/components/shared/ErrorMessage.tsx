export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm font-medium">
      {message}
    </div>
  );
}

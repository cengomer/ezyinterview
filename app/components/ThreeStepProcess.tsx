export default function ThreeStepProcess() {
  const steps = [
    { label: "Upload CV" },
    { label: "Paste Job" },
    { label: "Get Questions" },
  ];
  return (
    <section className="w-full bg-white py-6">
      <div className="max-w-xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 px-4">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg border-2 border-blue-500">
              {idx + 1}
            </div>
            <span className="ml-3 mr-3 text-base md:text-lg font-medium text-gray-800 whitespace-nowrap">{step.label}</span>
            {idx < steps.length - 1 && (
              <span className="hidden md:inline-block text-gray-400 text-2xl mx-2">→</span>
            )}
            {idx < steps.length - 1 && (
              <span className="md:hidden text-gray-400 text-xl mx-2">↓</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

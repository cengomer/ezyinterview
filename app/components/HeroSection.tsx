export default function HeroSection() {
  return (
    <section className="w-full bg-white pt-24 pb-10 text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Get Personalized Interview Questions in Minutes
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Upload your CV and job description to instantly generate tailored interview questions.
        </p>
        <a href="#get-started">
          <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-lg">
            Try It Free - No Signup Required
          </button>
        </a>
      </div>
    </section>
  );
}

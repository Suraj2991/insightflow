import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">IF</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">InsightFlow</span>
          </div>
          <Link 
            href="/admin" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Admin →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Document Review,
          <span className="block text-blue-600">Made Simple</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload documents, get intelligent analysis. White-label platform 
          for property, legal, financial, and technical document review.
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <Link 
            href="/admin" 
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
          >
            Get Started
          </Link>
          <Link 
            href="/workflow/complete" 
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
          >
            See Demo
          </Link>
        </div>

        {/* Simple Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Setup</h3>
            <p className="text-gray-600 text-sm">Domain-aware configuration gets you running in minutes, not hours.</p>
          </div>
          
          <div className="p-6">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Expert Analysis</h3>
            <p className="text-gray-600 text-sm">Industry-specific AI prompts deliver professional-grade insights.</p>
          </div>
          
          <div className="p-6">
            <div className="text-2xl mb-3">🏷️</div>
            <h3 className="font-semibold text-gray-900 mb-2">White Label</h3>
            <p className="text-gray-600 text-sm">Fully customizable platform ready for your brand and clients.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">IF</span>
            </div>
            <span>InsightFlow Core</span>
          </div>
          <p>White-label document review platform</p>
        </div>
      </footer>
    </div>
  );
}
import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">InsightFlow Property</h1>
                <p className="text-sm text-gray-600 -mt-1">Property purchase companion</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                Navigate your property purchase with confidence
              </h1>
              
              <div className="bg-slate-100 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-700 font-medium mb-3">
                  Property purchases in the UK involve <span className="font-bold text-slate-800">20+ different documents</span> from <span className="font-bold text-slate-800">5+ different sources</span>.
                </p>
                <p className="text-gray-600">
                  Most buyers feel overwhelmed and don't know what questions to ask professionals.
                </p>
              </div>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Understand paperwork, spot what's missing, identify areas that need focus, and get answers when needed throughout the process.
              </p>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800 font-medium">
                      This tool doesn't replace professional advice — it helps maximize its value
                    </p>
                  </div>
                </div>
              </div>

              <Link 
                href="/review" 
                className="inline-flex items-center px-8 py-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                Start property purchase review
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl p-8 border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">TA6 Property Information Form</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Local Authority Search</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700">Homebuyer Survey</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Environmental Search</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Missing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-400">Water & Drainage Search</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Pending</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 font-medium">Key insights:</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Environmental search missing - high priority</li>
                    <li>• Drainage search delayed - track progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Property focused */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How property purchase organization works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No jargon, no complicated processes. Just clear guidance through the property buying journey.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-slate-100 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Purchase details</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Share information about the property, timeline, professionals involved, and progress so far. Takes 5 minutes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-amber-100 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Upload paperwork</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Share TA6 forms, surveys, searches, and other paperwork. Everything gets organized systematically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Get focused insights</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Receive clear analysis highlighting areas that need attention, missing items, and priority actions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. Ongoing Q&A support</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Get explanations of jargon, clarify confusing sections, and ask questions throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / trust */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              "This would have been helpful for the first property purchase"
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The average UK property purchase involves dozens of documents across multiple parties. 
              Most buyers spend <span className="font-bold text-gray-800">£800-£1,500 on conveyancing alone</span>, plus surveys, searches, and other fees, but still feel overwhelmed by the process.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-700">12-16</div>
                <div className="text-gray-600">Weeks to complete</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-700">£1,375</div>
                <div className="text-gray-600">Average conveyancing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-700">10+</div>
                <div className="text-gray-600">Document types</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to take control of the process?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Start your property purchase review now. It's free, takes 10-15 minutes, and provides a clear action plan.
          </p>
          <Link 
            href="/review" 
            className="inline-flex items-center px-8 py-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Begin property purchase review
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-slate-300 text-sm mt-4">
            Free forever • No signup required • Results in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">InsightFlow Property</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Helping UK property buyers navigate the purchase process with confidence
            </p>
            <p className="text-gray-500 text-xs">
              This tool provides guidance only. Always consult qualified professionals for legal and financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

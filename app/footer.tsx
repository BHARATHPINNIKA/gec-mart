'use client'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="GEC Mart"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold">
                GEC<span className="gradient-text">Mart</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              The student marketplace for engineering tools.
            </p>
          </div>

          {/* Institution */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
              Institution
            </h3>
            <p className="text-sm text-slate-300 mb-1">
              Bharath Pinnika Department of Information Technology
            </p>
            <p className="text-sm text-slate-400">
              Seshachala Rao Gudlavalleru Engineering College
            </p>
          </div>

          {/* Built by */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
              Built by
            </h3>
            <p className="text-sm text-slate-300 mb-1">Bharath Pinnika</p>
            <p className="text-sm text-slate-400">© 2026 GEC Mart</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
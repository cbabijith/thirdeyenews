'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-border/40 w-full mt-auto">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-12 pb-12 border-b border-border/30">
          {/* Brand Column (Col Span 5) */}
          <div className="md:col-span-5 flex flex-col gap-4 mb-4 md:mb-0">
            <Link href="/" prefetch={false} className="inline-block hover:opacity-90 transition-opacity">
              <img src="/thirdeye.svg" alt="ThirdEye News" className="h-9 w-auto" />
            </Link>
            <p className="text-on-surface-variant/80 text-[13px] leading-relaxed max-w-sm">
              പക്ഷം ചേരാതെ, മുഖം നോക്കാതെ, സമഗ്രമായ വാർത്തകൾ. നേരിനു നേരേ തുറന്നുവെച്ച വാർത്തയുടെ മൂന്നാം കണ്ണ്.!!
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-2">
              <a 
                href="https://chat.whatsapp.com/K87BAlQ3O3g6AW6SOuETY3?s=cl&p=a&ilr=4" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300"
                aria-label="WhatsApp Channel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[16px] h-[16px] fill-current">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
              </a>
              <a 
                href="mailto:thirdeyenewslive@gmail.com" 
                className="w-8 h-8 rounded-full bg-surface-container-high border border-border/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                aria-label="Email Us"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-surface-container-high border border-border/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                aria-label="Share Site"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
            </div>

            {/* Join WhatsApp Group Section */}
            <div className="mt-4">
              <div className="flex flex-col gap-4 p-5 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md shadow-[#25D366]/20 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold text-on-surface">വാട്സ്ആപ്പ് ഗ്രൂപ്പിൽ അംഗമാകൂ</h5>
                    <p className="text-on-surface-variant/80 text-[11px] leading-snug">വാർത്തകൾ അതിവേഗം വാട്സ്ആപ്പിൽ ലഭിക്കാൻ ജോയിൻ ചെയ്യുക</p>
                  </div>
                </div>
                <a 
                  href="https://chat.whatsapp.com/K87BAlQ3O3g6AW6SOuETY3?s=cl&p=a&ilr=4" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-[12px] font-bold shadow-md shadow-[#25D366]/10 flex items-center gap-1.5 transition-all duration-300 justify-center w-full"
                >
                  Join WhatsApp Group
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links Column (Col Span 2) */}
          <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-border/40 bg-surface-container-low p-5 md:border-0 md:bg-transparent md:p-0 md:rounded-none">
            <h4 className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Navigation
            </h4>
            <ul className="flex flex-row md:flex-col gap-x-5 gap-y-2 md:gap-3 flex-wrap md:flex-nowrap">
              <li>
                <Link href="/" prefetch={false} className="text-on-surface-variant/80 hover:text-primary text-[13px] transition-colors duration-200">
                  ഹോം (Home)
                </Link>
              </li>
              <li>
                <a href="#" className="text-on-surface-variant/80 hover:text-primary text-[13px] transition-colors duration-200">
                  ഞങ്ങളെക്കുറിച്ച്
                </a>
              </li>
              <li>
                <a href="#" className="text-on-surface-variant/80 hover:text-primary text-[13px] transition-colors duration-200">
                  പരസ്യം (Ads)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column (Col Span 3) */}
          <div className="md:col-span-3 flex flex-col gap-4 rounded-2xl border border-border/40 bg-surface-container-low p-5 md:border-0 md:bg-transparent md:p-0 md:rounded-none">
            <h4 className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Address
            </h4>
            <div className="flex flex-col gap-3 text-[13px] text-on-surface-variant/80">
              <p className="leading-relaxed">
                Excel Building, Sastri Road,<br />
                Kottayam - 686001
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[14px]">call</span>
                <a href="tel:9847200864" className="hover:text-primary transition-colors text-on-surface-variant font-medium">
                  9847200864
                </a>
              </div>
              <a 
                href="https://www.google.com/maps?q=9.591900825500488,76.52499389648438&z=17&hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline text-[12px] flex items-center gap-1 mt-1 font-medium"
              >
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                Google Maps
              </a>
            </div>
          </div>

          {/* Legal / Meta Column (Col Span 2) */}
          <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-border/40 bg-surface-container-low p-5 md:border-0 md:bg-transparent md:p-0 md:rounded-none">
            <h4 className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-on-surface-variant/80 hover:text-primary text-[13px] transition-colors duration-200">
                  സ്വകാര്യതാ നയം
                </a>
              </li>
              <li>
                <a href="#" className="text-on-surface-variant/80 hover:text-primary text-[13px] transition-colors duration-200">
                  സമ്പർക്കം
                </a>
              </li>
              <li className="text-[11px] text-on-surface-variant/50 mt-1">
                Since 2016
              </li>
              <li className="text-[11px] text-on-surface-variant/50">
                Chief Editor: Sreekumar
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-6 md:pt-8 gap-4 text-[12px] text-on-surface-variant/60">
          <p>© 2026 ThirdEye News. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Made with precision by</span>
            <a 
              href="https://abijithcb.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-on-surface hover:text-primary transition-colors font-medium underline decoration-border"
            >
              abijithcb.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}


'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-border/40 w-full mt-auto">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-border/30">
          {/* Brand Column (Col Span 5) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link href="/" prefetch={false} className="inline-block hover:opacity-90 transition-opacity">
              <img src="/thirdeye.svg" alt="ThirdEye News" className="h-9 w-auto" />
            </Link>
            <p className="text-on-surface-variant/80 text-[13px] leading-relaxed max-w-sm">
              പക്ഷം ചേരാതെ, മുഖം നോക്കാതെ, സമഗ്രമായ വാർത്തകൾ. നേരിനു നേരേ തുറന്നുവെച്ച വാർത്തയുടെ മൂന്നാം കണ്ണ്.!!
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-2">
              <a 
                href="https://chat.whatsapp.com/EDpxcoLm36sGvoGLYlv4b9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-surface-container-high border border-border/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                aria-label="WhatsApp Channel"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
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
          </div>

          {/* Quick Links Column (Col Span 2) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
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
          <div className="md:col-span-3 flex flex-col gap-4">
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
          <div className="md:col-span-2 flex flex-col gap-4">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-8 gap-4 text-[12px] text-on-surface-variant/60">
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

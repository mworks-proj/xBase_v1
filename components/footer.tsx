import { taxPortalConfig } from "@/lib/config"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border bg-background/50 backdrop-blur">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">xT</span>
              </div>
              <span className="font-semibold">{taxPortalConfig.providerDisplayName}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Professional tax preparation services with secure document handling and flexible payment options.
            </p>
            <p className="text-xs text-muted-foreground">
              Built by {taxPortalConfig.builtBy}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/get-started" className="hover:text-foreground transition-colors">
                  Simple W-2 Returns
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-foreground transition-colors">
                  Self-Employed / 1099
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-foreground transition-colors">
                  Small Business Tax
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Portal */}
          <div>
            <h4 className="font-semibold mb-4">Client Portal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Client Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${taxPortalConfig.supportEmail}`} className="hover:text-foreground transition-colors">
                  {taxPortalConfig.supportEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${taxPortalConfig.supportPhone}`} className="hover:text-foreground transition-colors">
                  {taxPortalConfig.supportPhone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {taxPortalConfig.providerName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={taxPortalConfig.links.github} target="_blank" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
            <span className="text-border">|</span>
            <span className="text-xs">
              Powered by{" "}
              <Link href={taxPortalConfig.links.xrpl} target="_blank" className="text-accent hover:underline">
                XRPL
              </Link>
              {" & "}
              <Link href={taxPortalConfig.links.xahau} target="_blank" className="text-accent hover:underline">
                Xahau
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

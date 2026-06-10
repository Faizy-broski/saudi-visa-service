import Link from 'next/link';

interface Crumb { label: string; href?: string }

interface PageHeroProps {
  tag: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  breadcrumbs?: Crumb[];
}

export default function PageHero({ tag, title, subtitle, icon, breadcrumbs }: PageHeroProps) {
  return (
    <section
      className="pt-44 pb-24 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A385A 0%, #1a6498 50%, #3CA5D4 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="container mx-auto px-6 relative z-10 text-center max-w-2xl">

        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center justify-center gap-1.5 text-xs mb-6 flex-wrap">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {!isLast && crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="font-medium transition-opacity hover:opacity-100"
                      style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold" style={{ color: isLast ? '#ffffff' : 'rgba(255,255,255,0.6)' }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        {/* Tag pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest mb-8"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}
        >
          {icon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          <span style={{ color: '#ffffff' }}>{tag}</span>
        </div>

        <h1
          className="font-bold leading-tight mb-5"
          style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', color: '#ffffff' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm leading-relaxed mx-auto"
            style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '460px' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

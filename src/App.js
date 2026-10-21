import React, { useEffect, useState } from 'react';
import content, { languages } from './i18n/content';
import './App.scss';

const STORAGE_KEY = 'mj-lang';
const resumeUrl = `${process.env.PUBLIC_URL}/resumes/Mohammad_Jafariyan_Software_Engineer.pdf`;
// Languages with published posts in content/blog; others fall back to the English blog.
const blogLangs = ['fa'];
const blogUrl = code => `${process.env.PUBLIC_URL}${blogLangs.includes(code) ? `/${code}` : ''}/blog/`;
const phone = { href: 'tel:+989148980692', label: '+98 914 898 0692' };
const whatsappUrl = 'https://wa.me/989148980692';
const telegram = { href: 'https://t.me/MohammadJafariyan7', label: '@MohammadJafariyan7' };
const profileUrl = `${process.env.PUBLIC_URL}/images/profile.jpg`;

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && content[saved]) return saved;
  } catch (_) {}
  const nav = (typeof navigator !== 'undefined' && (navigator.language || '')).toLowerCase();
  if (nav.startsWith('fa')) return 'fa';
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('tr')) return 'tr';
  return 'en';
}

function App() {
  const [lang, setLang] = useState(detectLang);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = content[lang];

  useEffect(() => {
    document.documentElement.lang = t.locale;
    document.documentElement.dir = t.dir;
    document.title = t.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.meta.description);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }, [lang, t]);

  const setLanguage = code => {
    setLang(code);
    setMenuOpen(false);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="navigation">
        <a className="brand" href="#home" aria-label={`${t.hero.brand}, home`}>
          MJ<span>.</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? t.nav.close : t.nav.menu}
        </button>
        <nav
          id="main-navigation"
          className={menuOpen ? 'is-open' : ''}
          aria-label="Main"
          onClick={() => setMenuOpen(false)}
        >
          <a href="#services">{t.nav.services}</a>
          <a href="#work">{t.nav.work}</a>
          <a href="#process">{t.nav.process}</a>
          <a href={blogUrl(lang)}>{t.nav.blog}</a>
          <a className="nav-contact" href="#contact">
            {t.nav.contact}
          </a>
        </nav>
        <div className="lang-switch" role="group" aria-label="Language">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              className={lang === code ? 'is-active' : ''}
              onClick={() => setLanguage(code)}
              aria-pressed={lang === code}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main id="main">
        <section id="home" className="hero">
          <div className="hero-media" aria-hidden="true">
            <img src={profileUrl} alt="" width="1600" height="1067" fetchpriority="high" />
            <div className="hero-veil" />
          </div>
          <div className="hero-content wrap">
            <p className="hero-brand reveal">{t.hero.brand}</p>
            <p className="eyebrow reveal delay-1">{t.hero.role}</p>
            <h1 className="reveal delay-2">{t.hero.headline}</h1>
            <p className="intro reveal delay-3">{t.hero.support}</p>
            <div className="hero-actions reveal delay-4">
              <a className="button" href="#contact">
                {t.hero.ctaPrimary}
              </a>
              <a href="#process">{t.hero.ctaSecondary}</a>
            </div>
            <p className="location reveal delay-5">
              <span /> {t.hero.location}
            </p>
          </div>
        </section>

        <div className="domain-strip">
          <div className="wrap">
            <span>{t.strip.label}</span>
            <p>
              {t.strip.items.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <i>/</i>}
                  {item}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>

        <section className="wrap section" id="services">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.services.eyebrow}</p>
              <h2>{t.services.title}</h2>
            </div>
            <p>{t.services.lead}</p>
          </div>
          <div className="service-grid">
            {t.services.items.map(item => (
              <article key={item.num}>
                <span className="small-number">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <small>{item.tags}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="why-section" id="why">
          <div className="wrap section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.why.eyebrow}</p>
                <h2>{t.why.title}</h2>
              </div>
              <p>{t.why.lead}</p>
            </div>
            <div className="why-grid">
              {t.why.points.map(point => (
                <article key={point.title}>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="work-section" id="work">
          <div className="wrap section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.work.eyebrow}</p>
                <h2>{t.work.title}</h2>
              </div>
              <p>{t.work.lead}</p>
            </div>
            <div className="project-grid">
              {t.work.items.map((item, index) => (
                <article className="project" key={item.name}>
                  <div className="project-top">
                    <span>{item.category}</span>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  <div className="project-bottom">
                    <p className="tech">{item.tags}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.linkLabel}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap section" id="process">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.process.eyebrow}</p>
              <h2>{t.process.title}</h2>
            </div>
          </div>
          <div className="process-grid">
            {t.process.steps.map(step => (
              <article key={step.num}>
                <span className="small-number">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap section contact" id="contact">
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.lead}</p>
          <a className="email" href={`mailto:${t.contact.email}`}>
            {t.contact.email}
          </a>
          <ul className="direct-contact">
            <li>
              <span>{t.contact.phone}</span>
              <a href={phone.href} dir="ltr">
                {phone.label}
              </a>
            </li>
            <li>
              <span>{t.contact.whatsapp}</span>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" dir="ltr">
                {phone.label}
              </a>
            </li>
            <li>
              <span>{t.contact.telegram}</span>
              <a href={telegram.href} target="_blank" rel="noopener noreferrer" dir="ltr">
                {telegram.label}
              </a>
            </li>
          </ul>
          <div className="hero-actions contact-actions">
            <a className="button" href={`mailto:${t.contact.email}`}>
              {t.contact.cta}
            </a>
          </div>
          <div className="socials">
            <a href="https://github.com/Mohammadjafariyan" target="_blank" rel="noopener noreferrer">
              {t.contact.github}
            </a>
            <a
              href="https://www.linkedin.com/in/mohammad-jafariyan7"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.contact.linkedin}
            </a>
            <a href={resumeUrl} download>
              {t.contact.resume}
            </a>
          </div>
        </section>
      </main>

      <footer className="wrap">
        <a className="brand" href="#home">
          MJ<span>.</span>
        </a>
        <p>{t.footer.tagline}</p>
        <a href="#home">{t.footer.top}</a>
      </footer>
    </>
  );
}

export default App;

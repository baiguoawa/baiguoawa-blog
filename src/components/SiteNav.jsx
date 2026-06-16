export function SiteNav({ context = "home" }) {
  const isHome = context === "home";
  const className = isHome ? "site-nav" : "site-nav site-nav-static";
  const links = isHome
    ? {
        mark: "#home",
        about: "#about",
        articles: "#articles",
        links: "#links",
      }
    : {
        mark: "/",
        about: "/#about",
        articles: "/articles",
        links: "/#links",
      };

  return (
    <nav className={className} aria-label="主导航">
      <a className="nav-mark magnetic-button" href={links.mark}>
        白果<span className="latin">awa</span>
      </a>
      <div className="nav-links">
        <a className="magnetic-button" href={links.about}>
          关于
        </a>
        <a className="magnetic-button" href={links.articles}>
          文章
        </a>
        <a className="magnetic-button" href={links.links}>
          链接
        </a>
      </div>
    </nav>
  );
}

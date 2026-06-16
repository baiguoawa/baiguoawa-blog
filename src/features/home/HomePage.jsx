import { GlobalCursor } from "@/components/GlobalCursor";
import { SiteNav } from "@/components/SiteNav";
import { WaveBackground } from "@/components/ui/wave-background";

import { HomeEnhancements } from "./HomeEnhancements";

export function HomePage() {
  return (
    <>
      <SiteNav />
      <WaveBackground className="home-wave-background" />

      <main>
        <section id="home" className="panel hero" aria-label="首页">
          <div className="hero-code-field" aria-hidden="true" />
          <h1 className="reveal-line" data-copy="你好">
            你好
          </h1>
        </section>

        <section id="blog" className="panel statement">
          <h2 className="text-flipping-board" data-board-text="这里是白果awa的博客" aria-label="这里是白果awa的博客">
            这里是白果awa的博客
          </h2>
        </section>

        <section className="story-scroll-section" aria-label="关于我的信息">
          <div data-story-scroll-root>
            <section id="about" className="panel statement story-about-fallback">
              <h2 className="reveal-line story-intro-title" data-copy="接下来是关于我的信息.....👇">
                接下来是关于我的信息.....👇
              </h2>
            </section>
            <div className="story-scroll-fallback">
              <h2 className="story-scroll-fallback-title mixed">vibe coding 大师</h2>
            </div>
          </div>
        </section>

        <section id="articles" className="content-section articles">
          <div className="section-heading">
            <h2>文章</h2>
          </div>
          <div className="empty-state">
            <p>暂时还没有文章。</p>
            <a className="button magnetic-button" href="#links">
              先去别处看看
            </a>
          </div>
          <div className="three-d-marquee" aria-label="白果博客 3D 跑马灯">
            <div className="marquee-plane" aria-hidden="true">
              <div className="marquee-column marquee-column-a">
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
              </div>
              <div className="marquee-column marquee-column-b">
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
              </div>
              <div className="marquee-column marquee-column-c">
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
              </div>
              <div className="marquee-column marquee-column-d">
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
                <span className="marquee-card" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="links" className="footer-links">
        <div className="footer-fluid" aria-hidden="true">
          <span className="fluid-blob fluid-blob-a" />
          <span className="fluid-blob fluid-blob-b" />
          <span className="fluid-blob fluid-blob-c" />
        </div>
        <h2>随便逛逛</h2>
        <ul>
          <li>
            <a className="latin magnetic-button" href="https://github.com/" aria-label="GitHub 占位链接">
              GitHub
            </a>
          </li>
          <li>
            <a className="latin magnetic-button" href="https://www.bilibili.com/" aria-label="Bilibili 占位链接">
              Bilibili
            </a>
          </li>
          <li>
            <a className="latin magnetic-button" href="mailto:hello@example.com">
              Email
            </a>
          </li>
        </ul>
        <div className="footer-curved-loop" data-curved-loop-root aria-label="白果博客底部循环文字" />
      </footer>

      <GlobalCursor />
      <HomeEnhancements />
    </>
  );
}

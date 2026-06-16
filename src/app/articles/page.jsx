export const metadata = {
  title: "文章 | 白果awa的博客",
};

export default function ArticlesPage() {
  return (
    <main className="article-index-page">
      <header className="article-page-header">
        <p className="section-kicker latin">ARTICLES</p>
        <h1>文章</h1>
        <p>公开文章会显示在这里。</p>
      </header>

      <section className="empty-state article-index-empty" aria-label="文章列表为空">
        <p>暂时还没有文章。</p>
      </section>
    </main>
  );
}

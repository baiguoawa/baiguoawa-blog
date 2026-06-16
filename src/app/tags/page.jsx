export const metadata = {
  title: "标签 | 白果awa的博客",
  description: "按标签浏览公开文章。",
};

export default function TagsPage() {
  return (
    <main className="article-index-page tag-index-page">
      <header className="article-page-header">
        <p className="section-kicker latin">TAGS</p>
        <h1>标签</h1>
        <p>按主题查看已经发布的文章。</p>
      </header>
      <section className="empty-state article-index-empty" aria-label="标签列表为空">
        <p>暂时还没有文章。</p>
      </section>
    </main>
  );
}

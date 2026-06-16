import { GlobalCursor } from "@/components/GlobalCursor";
import { SiteNav } from "@/components/SiteNav";

export default function ArticlesLayout({ children }) {
  return (
    <>
      <SiteNav context="articles" />
      {children}
      <GlobalCursor />
    </>
  );
}

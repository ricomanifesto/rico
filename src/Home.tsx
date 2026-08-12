import Header from "@/components/Header";
import SkipLink from "@/components/SkipLink";
import IntroSection from "@/components/IntroSection";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import ProjectsSection from "@/components/ProjectsSection";
import LatestWritingSection from "@/components/LatestWritingSection";
import Footer from "@/components/Footer";
import type { WritingSummary } from "@/lib/writing";

interface HomeProps {
  readonly latestWriting: readonly WritingSummary[];
}

export default function Home({ latestWriting }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <IntroSection />
        <AboutMe />
        <Experience />
        <ProjectsSection />
        <LatestWritingSection posts={latestWriting} />
      </main>
      <Footer />
    </div>
  );
}

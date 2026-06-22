// src/Home.tsx - This should NOT contain any CSS
import Header from "@/components/Header";
import SkipLink from "@/components/SkipLink";
import IntroSection from "@/components/IntroSection";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <IntroSection />
        <AboutMe />
        <Experience />
        <ProjectsSection />
      </main>
      <Footer />
    </div>
  );
}

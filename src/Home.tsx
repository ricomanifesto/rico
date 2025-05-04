// src/Home.tsx - This should NOT contain any CSS
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <IntroSection />
        <ProjectsSection />
      </main>
      <Footer />
    </div>
  );
}
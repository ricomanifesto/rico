import { projectActionLinkBehavior, projects } from "../content/portfolio";
import type { ProjectActionLink as ProjectActionLinkData } from "../content/portfolio";

type ProjectActionLinkKind = "repository" | "demo";

interface ProjectActionLinkProps {
  readonly kind: ProjectActionLinkKind;
  readonly link: ProjectActionLinkData;
  readonly projectTitle: string;
}

const projectActionLabels: Record<ProjectActionLinkKind, string> = {
  repository: "Repository",
  demo: "Live site",
};

export default function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="portfolio-section">
      <div className="projects-content">
        <h2 id="projects-heading" className="section-title">
          Selected work
        </h2>

        <div
          aria-label="Featured projects"
          className="project-collection"
          data-testid="project-collection"
        >
          {projects.map((project) => (
            <article key={project.page.slug} className="project-card">
              <div className="project-card-media">
                {project.image?.decorative ? (
                  <img
                    src={project.image.src}
                    width={project.image.width}
                    height={project.image.height}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="project-card-image"
                  />
                ) : (
                <div className={`project-card-gradient ${project.bgGradient}`}></div>
                )}
              </div>

              <div className="project-card-content">
                <p className="project-card-name">{project.page.name}</p>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-description">{project.description}</p>
                <p className="project-card-tech-stack">Built with {project.techStack.join(", ")}.</p>

                <div className="project-card-links">
                  <a
                    href={`/projects/${project.page.slug}/`}
                    className="project-case-study-link"
                    aria-label={`Read ${project.page.name} case study`}
                  >
                    Case study
                  </a>

                  <div className="project-external-actions" aria-label={`${project.page.name} links`}>
                    <ProjectActionLink
                      kind="repository"
                      link={project.links.repository}
                      projectTitle={project.title}
                    />
                    {project.links.demo && (
                      <ProjectActionLink
                        kind="demo"
                        link={project.links.demo}
                        projectTitle={project.title}
                      />
                    )}
                  </div>
                </div>

                <div className="project-evidence-links">
                  <a
                    href={project.page.evidence.href}
                    target={project.page.evidence.external ? projectActionLinkBehavior.externalTarget : undefined}
                    rel={project.page.evidence.external ? projectActionLinkBehavior.externalRel : undefined}
                    aria-label={`Inspect ${project.page.name} evidence`}
                    className="project-evidence-link"
                  >
                    Inspect the evidence
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectActionLink({ kind, link, projectTitle }: ProjectActionLinkProps) {
  const label = projectActionLabels[kind];

  return (
    <a
      href={link.href}
      target={link.external ? projectActionLinkBehavior.externalTarget : undefined}
      rel={link.external ? projectActionLinkBehavior.externalRel : undefined}
      aria-label={`${label} for ${projectTitle}`}
      className="project-action-link"
    >
      {label}
    </a>
  );
}

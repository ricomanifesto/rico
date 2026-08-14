import { experiences } from "../content/portfolio";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="portfolio-section">
      <div className="experience-content">
        <h2 id="experience-heading" className="section-title">
          Experience
        </h2>

        <div className="experience-list">
          {experiences.map((experience) => (
            <article key={experience.company} className="experience-item">
              <div className="experience-item-heading">
                <p className="experience-company">{experience.displayCompany}</p>
                <p className="experience-period">{experience.period}</p>
              </div>
              <div className="experience-item-body">
                <h3>{experience.title}</h3>
                <ul className="experience-highlight-list">
                  {experience.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { SITE_URL } from "../../siteUrl";
import { projects } from "../../data/projects";
import ProjectsPageContent from "./ProjectsPageContent";

const title = "Projects";
const description = "Explore selected full-stack projects by Nishaj M, including web applications, automation tools, community products, and interactive 3D experiments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/projects" },
  openGraph: { title, description, url: "/projects", type: "website" },
  twitter: { title, description },
};

export default function ProjectsPage() {
  const projectsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Selected Projects by Nishaj M",
    description,
    url: `${SITE_URL}/projects`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          keywords: project.tags.join(", "),
        },
      })),
    },
  };

  return (
    <>
      <ProjectsPageContent />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd) }} />
    </>
  );
}

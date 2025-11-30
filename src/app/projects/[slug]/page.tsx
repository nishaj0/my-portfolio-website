import { notFound } from 'next/navigation';
import { projects } from '../../../data/projects';
import ProjectContent from './ProjectContent';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectContent project={project} />;
}

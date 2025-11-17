import { motion } from 'framer-motion';
import { Projects } from '../components';

function ProjectsPage() {
  return (
    <main className="pt-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            All <span className="text-outline">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
            A collection of the projects I’ve worked on, built while learning and experimenting with different technologies.
          </p>
        </motion.div>
      </div>
      <Projects showViewMore={false} />
    </main>
  );
};


export default ProjectsPage
import { useState } from 'react';
import './Work.css';

const projects = [
  {
    id: 1,
    title: 'Ford',
    subtitle: 'Branded Content',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
    categories: [],
    size: 'large'
  },
  {
    id: 2,
    title: 'Starbucks',
    subtitle: 'Digital Network Platform',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    categories: ['Digital', 'Platform', 'Product'],
    size: 'medium'
  },
  {
    id: 3,
    title: 'Peraton',
    subtitle: 'Do The Can\'t Be Done',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    categories: [],
    size: 'medium',
    hasArrow: true
  },
  {
    id: 4,
    title: 'Starbucks',
    subtitle: 'Digital Network Platform',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    categories: ['Digital', 'Platform', 'Product'],
    size: 'small'
  },
  {
    id: 5,
    title: 'Ford',
    subtitle: 'Rewards',
    image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=500&fit=crop',
    categories: [],
    size: 'large-tall'
  },
  {
    id: 6,
    title: 'Peraton',
    subtitle: 'Do The Can\'t Be Done',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    categories: [],
    size: 'small'
  },
  {
    id: 7,
    title: 'Ford',
    subtitle: 'Rewards',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=800&fit=crop',
    categories: [],
    size: 'large'
  },
  {
    id: 8,
    title: 'Peraton',
    subtitle: 'Do The Can\'t Be Done',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    categories: [],
    size: 'medium'
  }
];

function Work() {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <section className="work" id="work">
      <div className="work-header">
        <div className="work-title">
          <h2>Work</h2>
          <span className="work-years">2005-2025</span>
        </div>

        <div className="work-view-toggle">
          <button
            className={`view-btn ${viewMode === 'index' ? 'active' : ''}`}
            onClick={() => setViewMode('index')}
          >
            Index
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
        </div>
      </div>

      <div className={`work-grid ${viewMode}`}>
        {projects.map((project) => (
          <article
            key={project.id}
            className={`project-card ${project.size}`}
          >
            <div className="project-image">
              <img src={project.image} alt={project.title} loading="lazy" />
            </div>
            <div className="project-info">
              <h3>
                <span className="project-title">{project.title}</span>
                {' '}
                <span className="project-subtitle">{project.subtitle}</span>
              </h3>
              {project.categories.length > 0 && (
                <p className="project-categories">
                  {project.categories.join(', ')}
                </p>
              )}
              {project.hasArrow && (
                <span className="project-arrow">→</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Work;

import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-video-placeholder"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <p>
            <strong>AGCK</strong> is the work of Kirill Sudosa, a creative leader
            shaping brands through narrative-driven brand systems.
          </p>
          <p className="hero-subtitle">
            Combining strategy with visual craft to solve complex
            business challenges. Based in Brooklyn.
          </p>
        </div>

        <div className="hero-cta">
          <button className="demo-reel-btn">
            <span>Demo reel 2025</span>
            <span className="play-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#1a1aff"/>
                <path d="M10 8l6 4-6 4V8z" fill="white"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;

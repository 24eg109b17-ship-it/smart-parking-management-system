import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    ['01', 'Find your space', 'Browse campus areas and choose a car, bike, or truck space that fits.'],
    ['02', 'Reserve & arrive', 'Keep your booking in one place. Record entry when you reach your slot.'],
    ['03', 'Leave with clarity', 'Track your stay, see the hourly rate, and get a receipt when you exit.'],
  ];
  return <div className="parking-landing">
    <nav className="parking-nav" aria-label="Main navigation">
      <Link to="/" className="parking-wordmark"><span className="parking-mark">P</span> Smart Parking<span className="campus-pill">CAMPUS</span></Link>
      <div className="action-row"><Link to="/login" className="parking-nav-login">Sign in</Link><Link to="/register" className="btn btn-primary">Create account ↗</Link></div>
    </nav>
    <main>
      <section className="parking-hero">
        <div className="parking-hero-copy">
          <span className="eyebrow"><span className="live-dot" /> A LITTLE LESS CIRCLING. A LOT MORE CAMPUS.</span>
          <h1>Your day starts<br />with a <em>better space.</em></h1>
          <p>Find a spot before you arrive. Reserve it, track your stay, and leave the parking guesswork behind.</p>
          <div className="action-row"><Link to="/register" className="btn btn-primary btn-lg">Find my parking ↗</Link><Link to="/login" className="parking-text-link">Already have an account? →</Link></div>
          <div className="hero-notes"><span>✓ Car & bike spaces</span><span>✓ Transparent hourly billing</span><span>✓ All your stays, saved</span></div>
        </div>
        <div className="parking-map-card" aria-label="Illustration of campus parking spaces, not live availability">
          <div className="map-card-top"><span><span className="live-dot" /> CAMPUS PARKING</span><span className="illustration-label">ILLUSTRATION</span></div>
          <div className="map-heading"><h2>A space for every arrival.</h2><p>Main campus · North entrance</p></div>
          <div className="parking-road"><span>ENTRY →</span><i /><span>ONE WAY</span></div>
          <div className="landing-slot-grid">{['A01','A02','A03','A04','A05','A06','A07','A08'].map((slot, index) => <div key={slot} className={`landing-slot ${[1,4,6].includes(index) ? 'has-car' : index === 2 ? 'chosen' : ''}`}>
            {[1,4,6].includes(index) ? <svg viewBox="0 0 40 70" aria-hidden="true"><rect x="5" y="6" width="30" height="58" rx="9" fill="currentColor"/><rect x="9" y="17" width="22" height="13" rx="3" fill="#25473b"/><rect x="9" y="46" width="22" height="8" rx="2" fill="#25473b"/><path d="M8 10h6M26 10h6M8 60h6M26 60h6" stroke="#e3f1d5" strokeWidth="3"/></svg> : <span>{index === 2 ? '✓' : 'P'}</span>}<small>{slot}</small>
          </div>)}</div>
          <div className="map-card-bottom"><div><span className="legend-dot available" /> Available space</div><span>RESERVE. ARRIVE. RELAX.</span></div>
          <div className="map-floating-note"><span>↗</span><div><strong>One smooth arrival.</strong><small>Your next space is a few clicks away.</small></div></div>
        </div>
      </section>
      <section className="parking-how"><div className="how-heading"><span className="eyebrow">PARKING, WITHOUT THE DETOUR</span><h2>From finding a spot<br />to getting on with your day.</h2></div>
        <div className="parking-steps">{features.map(([number,title,copy]) => <article key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
    </main>
    <footer className="parking-footer"><span>Smart Parking Management System</span><span>Campus demonstration · Digital reservations · Clear receipts</span><Link to="/login">Administrator sign in →</Link></footer>
  </div>;
}

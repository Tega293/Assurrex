import { useState } from "react";
import { Link } from "react-router-dom";

const outcomes = [
  { name: "Valid Claim", icon: "✓", color: "valid", detail: "The details look eligible under the selected demo policy. Review the explanation and next steps." },
  { name: "Invalid Claim", icon: "×", color: "invalid", detail: "The claim does not meet a policy rule. AssureX shows which rule affected the result." },
  { name: "Manual Review", icon: "−", color: "review", detail: "Something needs a closer look, such as a missing document or duplicate invoice." },
];
const faqs = [
  { q: "Can I correct scanned details?", a: "Yes. Review and correct extracted receipt fields before submitting a claim. OCR can misread unclear images." },
  { q: "What if my claim needs review?", a: "A signed-in reviewer checks the claim and can record an Approved or Rejected decision with a note." },
  { q: "Is the result a final warranty decision?", a: "No. This competition prototype offers a recommendation using sample policies and synthetic training data." },
];

export default function Home({ theme, onToggleTheme, member }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="landing-page" id="top">
      <header className="public-header">
        <a href="#top" className="brand">ASSURE<span>X</span></a>
        <nav aria-label="Homepage navigation" className="public-links">
          <a href="#top">Home</a><a href="#how">How it works</a><a href="#coverage">Coverage</a><a href="#about">About</a><a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <button className="theme-button" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title="Toggle theme">{theme === "light" ? "☾" : "☀"}</button>
          <Link className="outline-button" to={member ? "/dashboard" : "/login"}>{member ? "Dashboard" : "Member login"}</Link>
        </div>
      </header>

      <section className="hero section-width">
        <div className="hero-copy">
          <p className="eyebrow">Smart warranty claim assessment</p>
          <h1>Warranty claims,<br />made clearer.</h1>
          <p className="hero-lead">Upload your receipt, check coverage, and understand our recommendation — so you know what to expect before you proceed.</p>
          <div className="hero-actions"><Link className="primary-button" to="/new-claim">Start a claim <span aria-hidden="true">→</span></Link><a className="secondary-button" href="#how"><span className="play-dot">▶</span> See how it works</a></div>
        </div>
        <div className="hero-visual" aria-label="Illustration of receipt analysis leading to manual review">
          <div className="invoice-card">
            <div className="invoice-top"><strong>INVOICE</strong><span className="skeleton-lines">━━━<br />━━━━</span></div>
            <div className="invoice-rule" />
            <div className="invoice-row"><span>Invoice No.</span><mark>INV-784329</mark></div>
            <div className="invoice-row"><span>Date</span><mark>12 Mar 2024</mark></div>
            <div className="invoice-row"><span>Product</span><mark>Wireless Headphones</mark></div>
            <div className="invoice-row"><span>Serial No.</span><mark>SN-8F2K-19D4</mark></div>
            <div className="invoice-lines"><i/><i/><i/><i/></div>
            <div className="invoice-total"><span>Total</span><b>$249.00</b></div>
          </div>
          <div className="dotted-arrow" aria-hidden="true">⟶</div>
          <div className="review-card"><span className="review-symbol">−</span><strong>Manual Review</strong><p>This invoice has been used in a previous claim. A reviewer will check the details and confirm the outcome.</p></div>
        </div>
      </section>

      <section className="feature-strip" id="about"><div className="section-width feature-grid">
        <div className="feature"><span className="feature-icon">▤</span><div><h3>Receipt scanning</h3><p>Upload a clear photo or PDF of your receipt.</p></div></div>
        <div className="feature"><span className="feature-icon">◇</span><div><h3>Coverage checks</h3><p>Check claim details against a selected warranty policy.</p></div></div>
        <div className="feature"><span className="feature-icon">♧</span><div><h3>Human review when needed</h3><p>Complex or unclear cases can be reviewed by a member.</p></div></div>
      </div></section>

      <section className="process-section" id="how"><div className="section-width">
        <h2>How AssureX works</h2><p className="section-intro">A simple process to get a clear recommendation.</p>
        <div className="steps">
          {[ ["1","▤","Submit details","Tell us about your product and the issue."], ["2","▣","Scan receipt","Upload a clear photo or PDF of your receipt."], ["3","◇","Check coverage","We check the claim against warranty rules."], ["4","▤","Review outcome","See a recommendation and next steps."] ].map(([n,icon,title,description]) => <div className="step" key={n}><div className="step-symbols"><span className="step-number">{n}</span><span className="step-icon">{icon}</span></div><h3>{title}</h3><p>{description}</p></div>)}
        </div>
      </div></section>

      <section className="explain-section section-width"><div className="explain-copy"><h2>Built to explain every decision</h2><p className="section-intro">We analyse your receipt, product and warranty details, then show you why a recommendation was made.</p><ul className="check-list"><li>Extracts key details from your receipt</li><li>Checks warranty dates and coverage</li><li>Looks for issues such as duplicate invoices</li><li>Gives a clear reason for the recommendation</li><li>Routes uncertain cases to human review</li></ul></div>
        <div className="assessment-card"><h3>Claim assessment example</h3><div className="assessment-product"><span className="headphone-icon">◉</span><div><strong>Wireless Headphones</strong><small>Brand X · Model WH-1000<br />Serial No. SN-8F2K-19D4</small></div></div><div className="assessment-line"><span className="status-good">✓</span><span>Warranty coverage</span><strong>Active</strong></div><div className="assessment-line"><span className="status-good">✓</span><span>Serial number match</span><strong>Matches product details</strong></div><div className="assessment-line"><span className="status-bad">×</span><span>Duplicate invoice</span><strong className="bad-text">Found in a previous claim</strong></div><div className="assessment-result"><span className="review-symbol">−</span><div><strong>Manual Review</strong><p>A reviewer will check the invoice and confirm the outcome.</p></div></div></div>
      </section>

      <section className="outcomes-section section-width"><h2>What the outcomes mean</h2><p className="section-intro">Every recommendation includes an explanation. A human reviewer can assess uncertain cases.</p><div className="outcome-grid">{outcomes.map(item => <div className={`outcome-card ${item.color}`} key={item.name}><span className="outcome-icon">{item.icon}</span><div><h3>{item.name}</h3><p>{item.detail}</p></div></div>)}</div></section>

      <section className="coverage-section section-width" id="coverage"><h2>Coverage options <span>(demo)</span></h2><p className="section-intro">Example warranty policies used by this prototype. Actual eligibility depends on the claim details.</p><div className="coverage-grid"><div className="coverage-card"><h3>Basic</h3><strong>12 months</strong><p>Example cover measured from the purchase date.</p></div><div className="coverage-card featured"><span className="coverage-badge">Popular example</span><h3>Standard</h3><strong>24 months</strong><p>Example cover measured from the purchase date.</p></div><div className="coverage-card"><h3>Extended</h3><strong>36 months</strong><p>Example cover measured from the purchase date.</p></div></div></section>

      <section className="faq-section section-width" id="faq"><div><h2>Frequently asked questions</h2><p className="section-intro">Quick answers to common questions.</p></div><div className="faq-list">{faqs.map((item,index) => <div className="faq-item" key={item.q}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{item.q}<span>{openFaq === index ? "−" : "⌄"}</span></button>{openFaq === index && <p>{item.a}</p>}</div>)}</div></section>
      <section className="final-cta section-width"><div><h2>Ready to check a claim?</h2><p>Upload your receipt, check coverage, and get a clear recommendation.</p></div><Link to="/new-claim">Start a claim <span aria-hidden="true">→</span></Link></section>
      <footer className="public-footer section-width"><a href="#top" className="brand">ASSURE<span>X</span></a><nav aria-label="Footer navigation"><a href="#about">About</a><a href="#how">How it works</a><a href="#coverage">Coverage</a><a href="#faq">FAQ</a><Link to="/login">Member login</Link></nav><small>Competition prototype</small></footer>
    </div>
  );
}

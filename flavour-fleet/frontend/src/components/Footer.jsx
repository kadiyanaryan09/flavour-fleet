export default function Footer() {
  return (
    <footer className="bg-ink text-cream/70 mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10 text-sm flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Flavour Fleet. A portfolio project — not a real food delivery service.</p>
        <p>Built with React, Tailwind CSS, Node.js, Express and MySQL.</p>
      </div>
    </footer>
  );
}

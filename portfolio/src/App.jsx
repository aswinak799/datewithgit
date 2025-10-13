import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function SpinningTorus() {
  return (
    <mesh rotation={[0.4, 0.8, 0]}>
      <torusKnotGeometry args={[1, 0.32, 128, 32]} />
      <meshStandardMaterial color="#8b5cf6" roughness={0.35} metalness={0.2} />
    </mesh>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="container mx-auto px-4 py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
        {title}
      </h2>
      <div className="text-neutral-300/90">{children}</div>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-white/5">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#" className="font-semibold text-white tracking-tight">A. Portfolio</a>
          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#projects" className="hover:text-white transition">Projects</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
            <a href="#" className="inline-flex items-center gap-2 bg-white text-neutral-900 rounded-full px-4 py-1.5 font-medium hover:bg-brand-200 transition">
              Resume
            </a>
          </div>
        </nav>
      </header>

      {/* Hero with 3D */}
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Odoo Developer & Full‑Stack Engineer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-neutral-300 text-lg"
          >
            I build robust Odoo modules, Python backends, and modern React front‑ends with 3D, motion, and clean UX.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex items-center gap-3"
          >
            <a href="#projects" className="px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-medium transition">
              View Projects
            </a>
            <a href="#contact" className="px-5 py-2 rounded-full border border-white/20 hover:border-white/40 text-white font-medium transition">
              Contact Me
            </a>
          </motion.div>
          <div className="mt-6 flex items-center gap-4 text-xl text-neutral-300">
            <a className="hover:text-white" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a className="hover:text-white" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a className="hover:text-white" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <FaXTwitter />
            </a>
          </div>
        </div>
        <div className="h-[420px] md:h-[520px] rounded-2xl overflow-hidden border border-white/5 order-1 md:order-2">
          <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
            <color attach="background" args={["#0a0a0a"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <SpinningTorus />
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>
      </section>

      <Section id="about" title="About">
        <p>
          I am an Odoo developer with strong Python and JavaScript experience. I craft
          scalable modules, integrate external APIs, and design user‑friendly frontends.
          I enjoy blending <span className="text-brand-400">3D</span> and motion into modern product experiences.
        </p>
      </Section>

      <Section id="projects" title="Projects">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((n) => (
            <motion.a
              key={n}
              href="#"
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/5 p-5 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="h-36 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-400/20 mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Project {n}</h3>
                  <p className="text-sm text-neutral-400">Odoo • React • API</p>
                </div>
                <span className="text-brand-300 opacity-0 group-hover:opacity-100 transition">→</span>
              </div>
            </motion.a>
          ))}
        </div>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          Open to freelance and full‑time opportunities. Reach out for Odoo, Python,
          and modern frontend projects.
        </p>
        <form className="mt-6 grid gap-4 max-w-xl">
          <input className="bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-brand-500" placeholder="Your email" />
          <textarea rows={5} className="bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-brand-500" placeholder="Tell me about your project" />
          <button type="button" className="justify-self-start px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-medium transition">Send</button>
        </form>
      </Section>

      <footer className="py-10 text-center text-sm text-neutral-500 border-t border-white/5">
        © {new Date().getFullYear()} Your Name. All rights reserved.
      </footer>
    </div>
  )
}

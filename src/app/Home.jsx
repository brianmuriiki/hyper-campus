import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import FeatureCard from '../components/FeatureCard'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo size={28} textSize="text-base" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill transition-colors hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24 lg:px-10 lg:gap-20">
        <div>
          <h1 className="animate-fade-up font-display text-4xl font-semibold leading-[1.1] tracking-tight opacity-0 md:text-5xl lg:text-6xl">
            Study with the notes{' '}
            <span className="relative inline-block">
              <span className="relative z-10">you actually took</span>
              <span
                className="animate-highlight-sweep absolute inset-x-0 bottom-1 z-0 h-3 bg-highlighter-soft"
                aria-hidden="true"
              />
            </span>
            .
          </h1>
          <p className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-ink-soft opacity-0 [animation-delay:100ms] lg:text-lg">
            Upload your coursework, ask an AI that only knows what you were actually taught,
            and revise alongside classmates in your course. Every answer points back to the
            page it came from.
          </p>
          <div className="animate-fade-up mt-8 flex items-center gap-6 opacity-0 [animation-delay:200ms]">
            <Link
              to="/register"
              className="rounded-md bg-fill px-5 py-3 text-sm font-medium text-on-fill transition-colors hover:opacity-90"
            >
              Create your account
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-ink underline decoration-highlighter decoration-2 underline-offset-4">
              See how it works
            </a>
          </div>
        </div>

        {/* Note-card → chat bubble sequence */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="animate-pop-in absolute -left-3 top-6 w-full rotate-[-4deg] rounded-lg border border-line bg-paper-raised p-4 shadow-sm [animation-delay:150ms]">
            <div className="h-2 w-16 rounded bg-line" />
          </div>
<div className="animate-pop-in card-hover relative rotate-[1.5deg] rounded-lg border border-line bg-paper-raised p-5 shadow-sm [animation-delay:350ms]">            <p className="text-xs font-medium text-ink-soft">Week 3 — linked lists.pdf</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              A doubly linked list keeps a pointer to both the{' '}
              <span className="bg-highlighter-soft">next and previous node</span>, so you can
              traverse it in either direction.
            </p>
          </div>
          <div className="animate-pop-in relative -mt-3 ml-8 max-w-[80%] rounded-lg rounded-tl-sm bg-fill p-4 text-on-fill shadow-sm [animation-delay:600ms]">
            <p className="text-sm leading-relaxed">
              So deletion just means re-linking the neighbors on both sides — see page 4.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <h2 className="font-display text-2xl font-semibold lg:text-3xl">Everything lives in one place</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Repository"
            description="Organize your notes into unit folders — PDFs, slides, docs, or photos of the whiteboard."
            rotate={-1}
            icon={<FolderIcon />}
          />
          <FeatureCard
            title="Hyper-Chat"
            description="Ask questions and get answers drawn only from your own uploaded material, with citations."
            rotate={0.5}
            icon={<ChatIcon />}
          />
          <FeatureCard
            title="Discussion"
            description="Chat with classmates in your year and course, in a shared room or one you create."
            rotate={-0.5}
            icon={<UsersIcon />}
          />
          <FeatureCard
            title="Analysis"
            description="See how much time you're actually spending revising, broken down by week and unit."
            rotate={1}
            icon={<ChartIcon />}
          />
        </div>
      </section>

      {/* Closing band */}
     {/* Closing band — intentionally a fixed dark accent panel in both themes */}
<section className="bg-accent-panel py-16">
  <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
    <h2 className="font-display text-2xl font-semibold text-on-accent-panel md:max-w-sm lg:text-3xl">
      Your notes are already the hard part. Let's put them to work.
    </h2>
          <Link
            to="/register"
            className="shrink-0 rounded-md bg-highlighter px-5 py-3 text-sm font-medium text-[#16213D] hover:bg-highlighter/90"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center px-6 py-8 lg:px-10">
        <Logo size={18} textSize="text-xs" />
      </footer>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.7-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15.5 14.3c2.4.3 4.5 2.3 4.5 5.2" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  )
}
import Reveal from "./Reveal";

function About() {
  const stack = ["React.js", "FastAPI", "Python", "Tailwind CSS", "Monaco Editor", "REST API"];

  return (
    <section id="about" className="max-w-7xl mx-auto px-8 py-24">
      <Reveal>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-10">
          <span className="font-dotted inline-block px-3 py-1.5 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[#5B8DEF] rounded-md text-[10px]">
            about.md
          </span>

          <h2 className="font-dotted text-3xl text-[var(--text-primary)] mt-6 tracking-wide">
            CodeGuard AI
          </h2>

          <p className="text-[var(--text-secondary)] text-lg mt-5 leading-8 max-w-3xl">
            CodeGuard AI is a static code review tool that scans Python code for
            security risks and quality issues before it ships. Paste a file into
            the workspace above and it returns a quality score, a severity-ranked
            list of findings, and a plain-language suggestion for fixing each one
            — the same first pass a senior reviewer would give your pull request,
            in about a second.
          </p>

          <div className="grid md:grid-cols-2 gap-10 mt-10">
            <div>
              <p className="font-dotted text-[10px] text-[var(--text-muted)] mb-3">objective</p>
              <p className="text-[var(--text-secondary)] leading-7">
                Automate the first pass of code review using static analysis and
                a predefined set of security rules — catching common mistakes,
                scoring maintainability, and surfacing fixes before a human
                reviewer ever needs to.
              </p>
            </div>

            <div>
              <p className="font-dotted text-[10px] text-[var(--text-muted)] mb-3">tech stack</p>
              <div className="flex flex-wrap gap-2">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--text-primary)] text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default About;
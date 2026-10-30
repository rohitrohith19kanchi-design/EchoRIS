
import { useState } from "react";

const initialMemories = [
  {
    id: 1,
    title: "College fest",
    description:
      "A fun day spent with friends at the college fest. One of those days I wish I could relive.",
    date: "October 29, 2026",
    people: ["Ananya"],
    place: "College campus",
    emotion: "Nostalgia",
    color: "from-violet-500/20 to-indigo-500/10",
  },
  {
    id: 2,
    title: "A quiet evening",
    description:
      "Watching the sunset and talking about absolutely everything.",
    date: "October 18, 2026",
    people: ["Rahul", "Ananya"],
    place: "Our favorite café",
    emotion: "Peace",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: 3,
    title: "The first project",
    description:
      "The excitement of building something together for the very first time.",
    date: "October 12, 2026",
    people: ["Rahul"],
    place: "College lab",
    emotion: "Pride",
    color: "from-amber-500/20 to-orange-500/10",
  },
];

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Memories", icon: "▤" },
  { name: "People", icon: "♧" },
  { name: "Places", icon: "⌖" },
];

function App() {
  const [memories, setMemories] = useState(initialMemories);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    person: "",
    place: "",
    emotion: "",
  });

  const filteredMemories = memories.filter((memory) => {
    const searchableText = [
      memory.title,
      memory.description,
      memory.people.join(" "),
      memory.place,
      memory.emotion,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };
const deleteMemory = () => {
  if (!selectedMemory) return;

  setMemories((previous) =>
    previous.filter((memory) => memory.id !== selectedMemory.id)
  );

  setSelectedMemory(null);
  setShowDeleteConfirm(false);
};
  const createMemory = (event) => {
    event.preventDefault();

    const newMemory = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      date: form.date || "Date not specified",
      people: form.person
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean),
      place: form.place || "Place not specified",
      emotion: form.emotion || "Not specified",
      color: "from-violet-500/20 to-indigo-500/10",
    };

    setMemories((previous) => [newMemory, ...previous]);
    setForm({
      title: "",
      description: "",
      date: "",
      person: "",
      place: "",
      emotion: "",
    });

    setShowForm(false);
    setActivePage("Memories");
  };

  const pageTitle =
    activePage === "Dashboard"
      ? "Your memories, connected."
      : activePage === "Memories"
        ? "Your memory archive."
        : activePage === "People"
          ? "The people in your story."
          : "Places that stay with you.";

  return (
    <div className="min-h-screen bg-[#090b14] text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0e18] px-5 py-7 md:flex">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300">
              ◈
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-wide">
                EchoRIS
              </h1>
              <p className="text-xs text-slate-500">
                Your memory archive
              </p>
            </div>
          </div>

          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  activePage === item.name
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                }`}
              >
                <span className="w-5 text-center text-lg">
                  {item.icon}
                </span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 text-lg text-violet-300">✧</div>
            <p className="text-sm font-medium">
              Every memory matters.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your moments, your connections, your story.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm">
              R
            </div>
            <div>
              <p className="text-sm font-medium">Your space</p>
              <p className="text-xs text-slate-500">
                Personal archive
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-12">
          <header className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                ◈
              </div>
              <span className="font-semibold">EchoRIS</span>
            </div>

            <div className="hidden text-sm text-slate-500 md:block">
              Your personal space
              <span className="mx-2 text-slate-700">/</span>
              <span className="text-slate-300">{activePage}</span>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="ml-auto rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400"
            >
              + New memory
            </button>
          </header>

          {/* Welcome section */}
          <section className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-violet-300/80">
              Your personal archive
            </p>

            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {pageTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              The moments that shaped you, the people who were
              there, and the feelings that stayed.
            </p>
          </section>

          {/* Stats */}
          <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-[#10121e] p-5">
              <p className="text-xs text-slate-500">
                Memories collected
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {memories.length}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Moments worth keeping
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#10121e] p-5">
              <p className="text-xs text-slate-500">
                People remembered
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {
                  new Set(
                    memories.flatMap((memory) => memory.people)
                  ).size
                }
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Part of your story
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-[#10121e] p-5 lg:col-span-1">
              <p className="text-xs text-slate-500">
                Your archive
              </p>
              <p className="mt-3 text-3xl font-semibold">
                Private
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Your memories belong to you
              </p>
            </div>
          </section>

          {/* Memory section */}
          <section>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  {activePage === "Dashboard"
                    ? "Recently remembered"
                    : activePage}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Explore the moments you've collected
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search memories..."
                  className="w-full rounded-xl border border-white/[0.07] bg-[#10121e] py-2.5 pl-9 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
                />
              </div>
            </div>

            {filteredMemories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <p className="text-sm text-slate-400">
                  No memories found.
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Try another search or create a new memory.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {filteredMemories.map((memory) => (
                  <button
                    key={memory.id}
                    onClick={() => setSelectedMemory(memory)}
                    className="group text-left"
                  >
                    <article
                      className={`h-full rounded-2xl border border-white/[0.06] bg-gradient-to-br ${memory.color} p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/20`}
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {memory.date}
                        </span>
                        <span className="text-slate-600 transition group-hover:text-violet-300">
                          ↗
                        </span>
                      </div>

                      <h4 className="text-lg font-medium text-slate-100">
                        {memory.title}
                      </h4>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                        {memory.description}
                      </p>

                      <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-violet-300">♧</span>
                          <span>
                            {memory.people.length
                              ? memory.people.join(", ")
                              : "No people linked"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-violet-300">⌖</span>
                          <span>{memory.place}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-violet-300">✧</span>
                          <span>{memory.emotion}</span>
                        </div>
                      </div>
                    </article>
                  </button>
                ))}
              </div>
            )}
          </section>

          <footer className="mt-16 border-t border-white/[0.05] py-6 text-center text-xs text-slate-700">
            EchoRIS · Where memories find their connections.
          </footer>
        </main>
      </div>

      {/* Create memory modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#11131f] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                  Preserve a moment
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  New memory
                </h3>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={createMemory} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Memory title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Give this memory a name"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  What happened? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Write down what you remember..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateForm("date", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-slate-400">
                    People
                  </label>
                  <input
                    value={form.person}
                    onChange={(event) =>
                      updateForm("person", event.target.value)
                    }
                    placeholder="Names, comma separated"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs text-slate-400">
                    Place
                  </label>
                  <input
                    value={form.place}
                    onChange={(event) =>
                      updateForm("place", event.target.value)
                    }
                    placeholder="Where did it happen?"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Emotion
                </label>
                <input
                  value={form.emotion}
                  onChange={(event) =>
                    updateForm("emotion", event.target.value)
                  }
                  placeholder="What feeling stayed with you?"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#090b14] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-slate-400 transition hover:bg-white/[0.03]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-violet-500 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
                >
                  Save memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Memory details modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#11131f] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-violet-300">
                Memory details
              </span>

              <button
                onClick={() => {
                  setSelectedMemory(null);
                   setShowDeleteConfirm(false);
}}
                className="text-xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <h3 className="text-2xl font-semibold">
              {selectedMemory.title}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              {selectedMemory.date}
            </p>

            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {selectedMemory.description}
            </p>

            <div className="mt-8 space-y-4 border-t border-white/[0.06] pt-5">
              <div>
                <p className="text-xs text-slate-500">People</p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedMemory.people.join(", ") || "None linked"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Place</p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedMemory.place}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Emotion</p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedMemory.emotion}
                </p>
              </div>
            </div>

            {/* Two-step delete verification */}
            <div className="mt-8 border-t border-white/[0.06] pt-5">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full rounded-xl border border-red-500/20 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  Delete memory
                </button>
              ) : (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Are you sure you want to delete this memory?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    This action cannot be undone.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-slate-400 transition hover:bg-white/[0.03]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={deleteMemory}
                      className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition hover:bg-red-400"
                    >
                      Yes, delete permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

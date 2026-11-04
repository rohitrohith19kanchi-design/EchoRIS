import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "echoris-memories";
const THEME_KEY = "echoris-theme";

const starterMemories = [
  {
    id: "memory-1",
    title: "A little afternoon worth keeping",
    content:
      "The sunlight came through the window just right. We talked about everything and nothing, and somehow the afternoon became one of my favorite memories.",
    date: "2026-10-24",
    people: ["My friends"],
    place: "The little café",
    tags: ["Friendship", "Little moments"],
    favorite: true,
    color: "lavender",
  },
  {
    id: "memory-2",
    title: "The day everything felt possible",
    content:
      "A new beginning. A little nervous, a little excited, but mostly grateful for the things that are still waiting to happen.",
    date: "2026-10-18",
    people: [],
    place: "Campus",
    tags: ["New beginnings"],
    favorite: false,
    color: "cream",
  },
  {
    id: "memory-3",
    title: "A conversation under the stars",
    content:
      "We stayed outside longer than we planned. The night was quiet, the sky was beautiful, and I wished I could save that exact feeling.",
    date: "2026-10-12",
    people: ["Someone special"],
    place: "The terrace",
    tags: ["Night", "Peace"],
    favorite: true,
    color: "blue",
  },
];

const navigation = [
  { id: "timeline", label: "The Timeline", icon: "⌛" },
  { id: "pensieve", label: "The Pensieve", icon: "✧" },
  { id: "favorites", label: "Memory Seals", icon: "✦" },
];

const emptyForm = {
  title: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  people: "",
  place: "",
  tags: "",
};

function readMemories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterMemories;
  } catch {
    return starterMemories;
  }
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function getRelativeDate(dateString) {
  const today = new Date();
  const date = new Date(`${dateString}T12:00:00`);

  const difference = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
      new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
      86400000
  );

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";

  return formatDate(dateString);
}

function App() {
  const [memories, setMemories] = useState(readMemories);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "cream";
  });

  const [activePage, setActivePage] = useState("timeline");
  const [search, setSearch] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState("");
  useEffect(() => {
  if (!toast) return;

  const timeout = setTimeout(() => {
    setToast("");
  }, 3000);

  return () => clearTimeout(timeout);
}, [toast]);

  const isMidnight = theme === "midnight";

  const themeClasses = isMidnight
    ? "bg-[#171725] text-[#f4efff]"
    : "bg-[#f8f4ec] text-[#39332e]";

  const cardClasses = isMidnight
    ? "bg-[#222234] border-[#39364f]"
    : "bg-[#fffdf8] border-[#e9e0d3]";

  const mutedText = isMidnight
    ? "text-[#aaa5c2]"
    : "text-[#93877b]";

  const accentText = "text-[#8c78bd]";

  const saveMemories = (nextMemories) => {
    setMemories(nextMemories);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMemories));
    } catch {
      setToast("Unable to save memories in this browser.");
    }
  };

  const changeTheme = () => {
    const nextTheme = isMidnight ? "cream" : "midnight";

    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Theme still changes for the current session.
    }
  };

  const filteredMemories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...memories]
      .filter((memory) => {
        if (activePage === "favorites" && !memory.favorite) {
          return false;
        }

        if (!query) return true;

        const searchableText = [
          memory.title,
          memory.content,
          memory.place,
          ...(memory.people || []),
          ...(memory.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [memories, search, activePage]);

  const favoriteCount = memories.filter(
    (memory) => memory.favorite
  ).length;

  const currentPage = navigation.find(
    (item) => item.id === activePage
  );

  const handleCreateMemory = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setToast("Give your memory a title and a story.");
      return;
    }

    const newMemory = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
      title: form.title.trim(),
      content: form.content.trim(),
      date: form.date,
      people: form.people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean),
      place: form.place.trim(),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      favorite: false,
      color: ["lavender", "cream", "blue"][
        Math.floor(Math.random() * 3)
      ],
    };

    saveMemories([newMemory, ...memories]);

    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setShowForm(false);
    setToast("Your memory has been preserved ✨");
  };

  const toggleFavorite = (memoryId) => {
    const updated = memories.map((memory) =>
      memory.id === memoryId
        ? { ...memory, favorite: !memory.favorite }
        : memory
    );

    saveMemories(updated);

    if (selectedMemory?.id === memoryId) {
      setSelectedMemory({
        ...selectedMemory,
        favorite: !selectedMemory.favorite,
      });
    }
  };

  const deleteMemory = (memoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to let this memory go?"
    );

    if (!confirmed) return;

    saveMemories(
      memories.filter((memory) => memory.id !== memoryId)
    );

    setSelectedMemory(null);
    setToast("Memory removed from your archive.");
  };

  const openCreateForm = () => {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setShowForm(true);
  };

  const closeModals = () => {
    setShowForm(false);
    setSelectedMemory(null);
  };

  return (
    <div
      className={`echoris-app ${
        isMidnight ? "theme-midnight" : "theme-cream"
      } min-h-screen transition-colors duration-500 ${themeClasses}`}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`enchanted-sidebar hidden w-[250px] shrink-0 flex-col border-r px-6 py-8 lg:flex ${
            isMidnight
              ? "border-[#39364f] bg-[#1c1c2c]"
              : "border-[#e8dfd2] bg-[#f3eee5]"
          }`}
        >
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <img
                src="/echoris_orbs.png"
                alt="EchoRIS logo"
                className="h-12 w-12 object-contain"
              />

              <div>
                <h1 className="font-serif text-2xl tracking-wide">
                  EchoRIS
                </h1>
                <p
                  className={`text-[10px] uppercase tracking-[0.25em] ${mutedText}`}
                >
                  A memory archive
                </p>
              </div>
            </div>
          </div>

          <p
            className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] ${mutedText}`}
          >
            Your collection
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                    isActive
                      ? "bg-[#e7def7] font-medium text-[#7761a8]"
                      : `${mutedText} hover:bg-[#e9e2f0] hover:text-[#7761a8]`
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10">
            <p
              className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] ${mutedText}`}
            >
              Your archive
            </p>

            <div
              className={`rounded-2xl border p-4 ${cardClasses}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>
                  Preserved moments
                </span>

                <span className={accentText}>✧</span>
              </div>

              <p className="font-serif text-3xl">
                {memories.length}
              </p>

              <p className={`mt-1 text-xs ${mutedText}`}>
                {favoriteCount} sealed memories
              </p>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div
              className={`rounded-2xl border p-4 ${cardClasses}`}
            >
              <p className="mb-2 font-serif text-lg">
                A little magic
              </p>

              <p className={`text-xs leading-5 ${mutedText}`}>
                Some moments deserve to live beyond the moment.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-4 w-full rounded-xl bg-[#8c78bd] px-4 py-3 text-sm text-white transition hover:bg-[#7965a9]"
              >
                + Preserve a memory
              </button>
            </div>

            <button
              onClick={changeTheme}
              className={`mt-5 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition hover:bg-[#e9e2f0] ${
                isMidnight ? "text-[#c7b9ed]" : "text-[#7761a8]"
              }`}
            >
              <span>
                {isMidnight ? "☀" : "☾"}{" "}
                {isMidnight ? "Return to Cream" : "Enter Midnight"}
              </span>

              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  isMidnight ? "bg-[#8c78bd]" : "bg-[#d7cfe5]"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    isMidnight ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-9">
          {/* TOP BAR */}

          <header className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <img
                src="/echoris_orbs.png"
                alt="EchoRIS logo"
                className="h-8 w-8 object-contain"
              />

              <span className="font-serif text-xl">EchoRIS</span>
            </div>

            <div className="hidden lg:block">
              <p className={`text-xs ${mutedText}`}>
                Your personal archive
              </p>

              <p className="mt-1 font-serif text-lg">
                A place for the things that matter.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={changeTheme}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isMidnight
                    ? "border-[#51476d] text-[#d4c8f5]"
                    : "border-[#ded3c4] text-[#7761a8]"
                }`}
              >
                {isMidnight ? "☀ Cream" : "☾ Midnight"}
              </button>

              <button
                onClick={openCreateForm}
                className="rounded-full bg-[#8c78bd] px-5 py-2.5 text-sm text-white shadow-sm transition hover:bg-[#7965a9]"
              >
                + New memory
              </button>
            </div>
          </header>

          {/* EDITORIAL INTRO */}

              <section className="cream-hero mb-10">            <p
              className={`mb-3 text-xs uppercase tracking-[0.25em] ${accentText}`}
            >
              {activePage === "favorites"
                ? "The memories you treasure"
                : activePage === "pensieve"
                ? "A moment from your past"
                : "Your story, beautifully kept"}
            </p>

            <h2 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {activePage === "favorites"
                ? "The memories you hold close."
                : activePage === "pensieve"
                ? "Step back into a moment."
                : "Your life, in little fragments."}
            </h2>

            <p
              className={`mt-4 max-w-xl text-sm leading-7 ${mutedText}`}
            >
              Every little moment has a place here. The ordinary,
              the extraordinary, and everything in between.
            </p>
          </section>

          {/* STATS */}

          <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className={`rounded-2xl border p-5 ${cardClasses}`}
            >
              <p className={`text-xs ${mutedText}`}>
                Memories preserved
              </p>

              <p className="mt-2 font-serif text-3xl">
                {memories.length}
              </p>

              <p className={`mt-1 text-xs ${mutedText}`}>
                Little pieces of your story
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${cardClasses}`}
            >
              <p className={`text-xs ${mutedText}`}>
                Memory seals
              </p>

              <p className="mt-2 font-serif text-3xl">
                {favoriteCount}
              </p>

              <p className={`mt-1 text-xs ${mutedText}`}>
                Moments held especially close
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${cardClasses}`}
            >
              <p className={`text-xs ${mutedText}`}>
                Your archive
              </p>

              <p className="mt-2 font-serif text-3xl">
                {new Set(memories.map((memory) => memory.date.slice(0, 4))).size}
              </p>

              <p className={`mt-1 text-xs ${mutedText}`}>
                Years of memories
              </p>
            </div>
          </section>

          {/* SEARCH + TIMELINE */}

          <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-serif text-2xl">
                  {currentPage?.label || "The Timeline"}
                </h3>

                <p className={`mt-1 text-xs ${mutedText}`}>
                  A collection of moments, arranged in time.
                </p>
              </div>

              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 sm:w-72 ${cardClasses}`}
              >
                <span className={accentText}>⌕</span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your memories..."
                  className={`w-full bg-transparent text-sm outline-none ${
                    isMidnight
                      ? "placeholder:text-[#77738e]"
                      : "placeholder:text-[#b0a59a]"
                  }`}
                />
              </div>
            </div>

            {/* TIMELINE */}

            {filteredMemories.length === 0 ? (
              <div
                className={`rounded-2xl border p-10 text-center ${cardClasses}`}
              >
                <div className="mb-4 text-4xl text-[#8c78bd]">
                  ✧
                </div>

                <h4 className="font-serif text-2xl">
                  No memories found
                </h4>

                <p className={`mt-2 text-sm ${mutedText}`}>
                  Your archive is waiting for its next little
                  moment.
                </p>

                <button
                  onClick={openCreateForm}
                  className="mt-5 rounded-full bg-[#8c78bd] px-5 py-2.5 text-sm text-white"
                >
                  Preserve a memory
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* TIMELINE LINE */}

                <div
                  className={`absolute bottom-0 left-[11px] top-2 w-px ${
                    isMidnight
                      ? "bg-[#5d507f]"
                      : "bg-[#d9cde9]"
                  }`}
                />

                <div className="space-y-8">
                  {filteredMemories.map((memory, index) => (
                    <article
                      key={memory.id}
                      className="relative pl-10"
                    >
                      {/* MEMORY MARK */}

                      <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#8c78bd] bg-[#f8f4ec] text-[8px] text-[#8c78bd]">
                        ✦
                      </div>

                      {/* DATE */}

                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <p
                          className={`text-xs font-medium uppercase tracking-[0.12em] ${accentText}`}
                        >
                          {formatDate(memory.date)}
                        </p>

                        {index === 0 && (
                          <span className="rounded-full bg-[#e7def7] px-2.5 py-1 text-[10px] text-[#7761a8]">
                            Latest memory
                          </span>
                        )}
                      </div>

                      {/* MEMORY CARD */}

                      <div
                        className={`scrapbook-card group relative overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-lg ${cardClasses}`}
                      >
                        <div className="flex">
                          <div
                            className={`w-2 shrink-0 ${
                              memory.color === "lavender"
                                ? "bg-[#c9b8e8]"
                                : memory.color === "blue"
                                ? "bg-[#aab9d8]"
                                : "bg-[#e7d8bc]"
                            }`}
                          />

                          <div className="min-w-0 flex-1 p-5 sm:p-7">
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <p
                                  className={`mb-2 text-[10px] uppercase tracking-[0.2em] ${mutedText}`}
                                >
                                  A fragment of your story
                                </p>

                                <h4 className="font-serif text-2xl leading-snug sm:text-3xl">
                                  {memory.title}
                                </h4>
                              </div>

                              <button
                                onClick={() =>
                                  toggleFavorite(memory.id)
                                }
                                aria-label="Toggle favorite"
                                className={`shrink-0 rounded-full p-2 text-xl transition ${
                                  memory.favorite
                                    ? "text-[#8c78bd]"
                                    : mutedText
                                }`}
                              >
                                {memory.favorite ? "✦" : "✧"}
                              </button>
                            </div>

                            <p
                              className={`max-w-3xl text-sm leading-7 ${mutedText}`}
                            >
                              {memory.content}
                            </p>

                            {(memory.place ||
                              memory.people?.length > 0) && (
                              <div
                                className={`mt-5 flex flex-wrap gap-4 text-xs ${mutedText}`}
                              >
                                {memory.place && (
                                  <span>
                                    ♧ {memory.place}
                                  </span>
                                )}

                                {memory.people?.length > 0 && (
                                  <span>
                                    ♡ {memory.people.join(", ")}
                                  </span>
                                )}
                              </div>
                            )}

                            {memory.tags?.length > 0 && (
                              <div className="mt-5 flex flex-wrap gap-2">
                                {memory.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`rounded-full px-3 py-1 text-[10px] ${
                                      isMidnight
                                        ? "bg-[#38334d] text-[#c7b9ed]"
                                        : "bg-[#eee7f7] text-[#806da9]"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#d9cde9] pt-4">
                              <span
                                className={`text-xs ${mutedText}`}
                              >
                                {getRelativeDate(memory.date)}
                              </span>

                              <button
                                onClick={() =>
                                  setSelectedMemory(memory)
                                }
                                className={`text-xs font-medium transition hover:underline ${accentText}`}
                              >
                                Open memory ↗
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* FOOTER */}

          <footer
            className={`mt-16 border-t pt-6 text-center text-xs ${mutedText} ${
              isMidnight
                ? "border-[#39364f]"
                : "border-[#e8dfd2]"
            }`}
          >
            <p className="font-serif text-base">
              “Some things are worth remembering.”
            </p>

            <p className="mt-2">
              EchoRIS · Your personal memory archive
            </p>
          </footer>
        </main>
      </div>

      {/* MOBILE NAVIGATION */}

      <div
        className={`fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t px-2 py-3 lg:hidden ${
          isMidnight
            ? "border-[#39364f] bg-[#1c1c2c]"
            : "border-[#e8dfd2] bg-[#fffdf8]"
        }`}
      >
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activePage === item.id
                ? "text-[#8c78bd]"
                : mutedText
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button
          onClick={openCreateForm}
          className="flex flex-col items-center gap-1 text-[10px] text-[#8c78bd]"
        >
          <span className="text-lg">＋</span>
          New memory
        </button>
      </div>

      {/* CREATE MEMORY MODAL */}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModals();
            }
          }}
        >
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-9 ${
              cardClasses
            }`}
          >
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p
                  className={`mb-2 text-xs uppercase tracking-[0.2em] ${accentText}`}
                >
                  The Enchanted Quill
                </p>

                <h3 className="font-serif text-3xl sm:text-4xl">
                  Preserve a little moment.
                </h3>

                <p className={`mt-2 text-sm ${mutedText}`}>
                  Write it down before the feeling fades.
                </p>
              </div>

              <button
                onClick={closeModals}
                className={`rounded-full px-3 py-2 ${mutedText}`}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleCreateMemory}
              className="space-y-5"
            >
              <div>
                <label
                  className={`mb-2 block text-xs ${mutedText}`}
                >
                  Give this memory a title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="A day I'll always remember..."
                  className={`w-full rounded-xl border px-4 py-3 font-serif text-xl outline-none focus:border-[#8c78bd] ${
                    isMidnight
                      ? "border-[#39364f] bg-[#1c1c2c]"
                      : "border-[#e8dfd2] bg-[#faf7f0]"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-xs ${mutedText}`}
                >
                  When did it happen?
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#8c78bd] ${
                    isMidnight
                      ? "border-[#39364f] bg-[#1c1c2c]"
                      : "border-[#e8dfd2] bg-[#faf7f0]"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-xs ${mutedText}`}
                >
                  Tell your story
                </label>

                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content: event.target.value,
                    })
                  }
                  placeholder="The little details, the feeling, the things you never want to forget..."
                  rows={6}
                  required
                  className={`w-full resize-y rounded-xl border px-4 py-4 text-sm leading-7 outline-none focus:border-[#8c78bd] ${
                    isMidnight
                      ? "border-[#39364f] bg-[#1c1c2c]"
                      : "border-[#e8dfd2] bg-[#faf7f0]"
                  }`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className={`mb-2 block text-xs ${mutedText}`}
                  >
                    People
                  </label>

                  <input
                    value={form.people}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        people: event.target.value,
                      })
                    }
                    placeholder="Separate names with commas"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#8c78bd] ${
                      isMidnight
                        ? "border-[#39364f] bg-[#1c1c2c]"
                        : "border-[#e8dfd2] bg-[#faf7f0]"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-xs ${mutedText}`}
                  >
                    Place
                  </label>

                  <input
                    value={form.place}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        place: event.target.value,
                      })
                    }
                    placeholder="Where did it happen?"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#8c78bd] ${
                      isMidnight
                        ? "border-[#39364f] bg-[#1c1c2c]"
                        : "border-[#e8dfd2] bg-[#faf7f0]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`mb-2 block text-xs ${mutedText}`}
                >
                  Tags
                </label>

                <input
                  value={form.tags}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tags: event.target.value,
                    })
                  }
                  placeholder="Friendship, travel, little moments..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#8c78bd] ${
                    isMidnight
                      ? "border-[#39364f] bg-[#1c1c2c]"
                      : "border-[#e8dfd2] bg-[#faf7f0]"
                  }`}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`rounded-xl border px-5 py-3 text-sm ${
                    isMidnight
                      ? "border-[#39364f]"
                      : "border-[#e8dfd2]"
                  }`}
                >
                  Maybe later
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#8c78bd] px-6 py-3 text-sm text-white transition hover:bg-[#7965a9]"
                >
                  ✧ Preserve this memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMORY DETAILS MODAL */}

      {selectedMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMemory(null);
            }
          }}
        >
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-9 ${
              cardClasses
            }`}
          >
            <div className="mb-6 flex items-start justify-between">
              <p
                className={`text-xs uppercase tracking-[0.2em] ${accentText}`}
              >
                A preserved fragment
              </p>

              <button
                onClick={() => setSelectedMemory(null)}
                className={`rounded-full px-3 py-2 ${mutedText}`}
              >
                ✕
              </button>
            </div>

            <p className={`mb-3 text-xs ${mutedText}`}>
              {formatDate(selectedMemory.date)}
            </p>

            <h3 className="font-serif text-3xl leading-tight sm:text-4xl">
              {selectedMemory.title}
            </h3>

            <p
              className={`mt-6 whitespace-pre-wrap text-sm leading-8 ${mutedText}`}
            >
              {selectedMemory.content}
            </p>

            {selectedMemory.place && (
              <p className={`mt-5 text-sm ${mutedText}`}>
                ♧ {selectedMemory.place}
              </p>
            )}

            {selectedMemory.people?.length > 0 && (
              <p className={`mt-3 text-sm ${mutedText}`}>
                ♡ {selectedMemory.people.join(", ")}
              </p>
            )}

            {selectedMemory.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedMemory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#e7def7] px-3 py-1 text-xs text-[#7761a8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-dashed border-[#d9cde9] pt-5">
              <button
                onClick={() =>
                  toggleFavorite(selectedMemory.id)
                }
                className={`rounded-xl border px-4 py-3 text-sm ${
                  isMidnight
                    ? "border-[#39364f]"
                    : "border-[#e8dfd2]"
                }`}
              >
                {selectedMemory.favorite
                  ? "✦ Remove memory seal"
                  : "✧ Add memory seal"}
              </button>

              <button
                onClick={() =>
                  deleteMemory(selectedMemory.id)
                }
                className="rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-50 hover:text-red-600"
              >
                Delete memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#8c78bd] px-5 py-3 text-sm text-white shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
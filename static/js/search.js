(function () {
  const queryInput = document.getElementById("archive-search-query");
  const submitButton = document.getElementById("archive-search-submit");
  const filtersRoot = document.getElementById("search-filters");
  const resultsRoot = document.getElementById("search-results");
  const emptyRoot = document.getElementById("search-empty");
  const statusRoot = document.getElementById("pagefind-status");
  const suggestionsRoot = document.getElementById("search-suggestions");
  const filterToggle = document.getElementById("search-filter-toggle");
  const sortButton = document.getElementById("search-sort-button");
  const pagefindJsUrl = window.__PAGEFIND_JS_URL;
  const pagefindBaseUrl = window.__PAGEFIND_BASE_URL;

  if (
    !queryInput ||
    !submitButton ||
    !filtersRoot ||
    !resultsRoot ||
    !emptyRoot ||
    !statusRoot ||
    !suggestionsRoot ||
    !filterToggle ||
    !sortButton ||
    !pagefindJsUrl ||
    !pagefindBaseUrl
  ) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const state = {
    query: (params.get("q") || "").trim(),
    filters: {
      tag: (params.get("tag") || params.get("category") || "").trim(),
      severity: (params.get("severity") || "").trim(),
      type: (params.get("type") || "").trim()
    },
    sort: (params.get("sort") || "relevance").trim(),
    filtersOpen: false
  };

  const filterLabels = {
    tag: "Tags",
    severity: "Severity",
    type: "Format"
  };

  const sortLabels = {
    relevance: "Relevance",
    title: "Title",
    date: "Date"
  };

  const sortModes = ["relevance", "title", "date"];
  const severityOrder = ["low", "medium", "high", "critical"];
  const activeFilterCount = () => Object.values(state.filters).filter(Boolean).length;

  let pagefind;
  let debounceTimer;
  let filterIndex = {};

  queryInput.value = state.query;
  state.filtersOpen = activeFilterCount() > 0;

  const escapeHtml = (value) =>
    value.replace(/[&<>"']/g, (char) => (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char]
    ));

  const queryId = (query) => {
    if (!query) {
      return "IDLE";
    }

    let hash = 0;

    for (const character of query) {
      hash = ((hash << 5) - hash) + character.charCodeAt(0);
      hash |= 0;
    }

    return `0x${(hash >>> 0).toString(16).toUpperCase().padStart(4, "0")}`;
  };

  const syncUrl = () => {
    const next = new URLSearchParams();

    if (state.query) {
      next.set("q", state.query);
    }

    for (const [key, value] of Object.entries(state.filters)) {
      if (value) {
        next.set(key, value);
      }
    }

    if (state.sort !== "relevance") {
      next.set("sort", state.sort);
    }

    const query = next.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  };

  const setStatus = (count, scanning = false) => {
    const suffix = scanning ? "SCANNING" : `RESULTS: ${String(count).padStart(3, "0")}`;
    statusRoot.textContent = `QUERY_ID: ${queryId(state.query)} // ${suffix}`;
  };

  const activeFilters = () => {
    const filters = {};

    for (const [key, value] of Object.entries(state.filters)) {
      if (value) {
        filters[key] = [value];
      }
    }

    return filters;
  };

  const sortFilterValues = (key, values) => {
    const entries = Object.entries(values);

    if (key === "severity") {
      return entries.sort((left, right) => severityOrder.indexOf(left[0]) - severityOrder.indexOf(right[0]));
    }

    return entries.sort((left, right) => left[0].localeCompare(right[0]));
  };

  const updateControls = () => {
    filterToggle.setAttribute("aria-expanded", state.filtersOpen ? "true" : "false");
    filterToggle.classList.toggle("is-active", state.filtersOpen || activeFilterCount() > 0);
    sortButton.textContent = `Sort: ${sortLabels[state.sort]}`;
  };

  const renderSuggestions = () => {
    const entries = sortFilterValues("tag", filterIndex.tag || {}).slice(0, 4);

    if (entries.length === 0) {
      suggestionsRoot.innerHTML = "";
      return;
    }

    suggestionsRoot.innerHTML = entries.map(([value]) => {
      const active = state.filters.tag === value;

      return `
        <button
          class="deep-search-suggestion${active ? " is-active" : ""}"
          type="button"
          data-suggestion-value="${escapeHtml(value)}"
        >
          ${escapeHtml(value).replace(/-/g, "_").toUpperCase()}
        </button>
      `;
    }).join("");
  };

  const renderFilters = () => {
    const groups = ["tag", "severity", "type"]
      .map((key) => {
        const entries = sortFilterValues(key, filterIndex[key] || {});

        if (entries.length === 0) {
          return "";
        }

        const buttons = entries.map(([value, count]) => {
          const active = state.filters[key] === value;

          return `
            <button
              class="search-filter-button${active ? " is-active" : ""}"
              type="button"
              data-filter-key="${key}"
              data-filter-value="${escapeHtml(value)}"
              aria-pressed="${active ? "true" : "false"}"
            >
              <span>${escapeHtml(value).replace(/-/g, "_").toUpperCase()}</span>
              <span class="search-filter-button__count">${count}</span>
            </button>
          `;
        }).join("");

        return `
          <section class="deep-search-filter-group">
            <h3>${filterLabels[key]}</h3>
            <div class="search-filter-list">
              ${buttons}
            </div>
          </section>
        `;
      })
      .join("");

    filtersRoot.hidden = !state.filtersOpen && activeFilterCount() === 0;
    filtersRoot.innerHTML = groups;
  };

  const renderEmpty = (message) => {
    resultsRoot.innerHTML = "";
    emptyRoot.hidden = false;
    emptyRoot.textContent = message;
  };

  const renderIdle = () => {
    setStatus(0);
    renderEmpty("Enter a query to execute a full-text archive scan.");
  };

  const youtubeThumbnail = (url) => {
    try {
      const parsed = new URL(url);

      if (parsed.hostname === "youtu.be") {
        return `https://i.ytimg.com/vi/${parsed.pathname.slice(1)}/hqdefault.jpg`;
      }

      if (parsed.hostname.includes("youtube.com")) {
        const id = parsed.searchParams.get("v");

        if (id) {
          return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }
      }
    } catch (_error) {
      return "";
    }

    return "";
  };

  const sortResults = (results) => {
    if (state.sort === "title") {
      return [...results].sort((left, right) => (left.meta.title || "").localeCompare(right.meta.title || ""));
    }

    if (state.sort === "date") {
      return [...results].sort((left, right) => (right.meta.date || "").localeCompare(left.meta.date || ""));
    }

    return results;
  };

  const layoutForIndex = (index) => {
    if (index === 0) {
      return "primary";
    }

    if (index < 3) {
      return "secondary";
    }

    return "compact";
  };

  const renderMedia = (result, layout) => {
    const thumbnail = youtubeThumbnail(result.meta.media_url || "");
    const tagLabel = escapeHtml((result.meta.tag || "archive-node").replace(/-/g, "_").toUpperCase());
    const severity = escapeHtml((result.meta.severity || "archive").replace(/-/g, "_").toUpperCase());

    if (thumbnail) {
      return `
        <div class="deep-search-result__media-frame">
          <img src="${thumbnail}" alt="${escapeHtml(result.meta.title || "Archive file")}" loading="lazy">
          <span class="deep-search-result__flag">${severity}</span>
        </div>
      `;
    }

    return `
      <div class="deep-search-result__placeholder deep-search-result__placeholder--${layout}">
        <span>${tagLabel}</span>
        <div></div>
      </div>
    `;
  };

  const renderResults = (results) => {
    emptyRoot.hidden = true;

    resultsRoot.innerHTML = sortResults(results).map((result, index) => {
      const layout = layoutForIndex(index);
      const title = escapeHtml(result.meta.title || "UNTITLED_FILE");
      const recordId = escapeHtml(result.meta.record_id || `ARCHIVE-${String(index + 1).padStart(3, "0")}`);
      const date = result.meta.date ? `MODIFIED: ${escapeHtml(result.meta.date)}` : "MODIFIED: UNKNOWN";
      const summary = result.meta.summary ? `<p class="deep-search-result__summary">${escapeHtml(result.meta.summary)}</p>` : "";
      const excerpt = result.excerpt ? `<div class="deep-search-result__excerpt">${result.excerpt}</div>` : "";
      const tag = result.meta.tag
        ? `<span>${escapeHtml(result.meta.tag).replace(/-/g, "_").toUpperCase()}</span>`
        : "";
      const severity = result.meta.severity
        ? `<span>${escapeHtml(result.meta.severity).replace(/-/g, "_").toUpperCase()}</span>`
        : "";
      const type = result.meta.type
        ? `<span>${escapeHtml(result.meta.type).replace(/-/g, "_").toUpperCase()}</span>`
        : "";

      return `
        <article class="deep-search-result deep-search-result--${layout}">
          <a class="deep-search-result__linkwrap" href="${result.url}">
            <div class="deep-search-result__layout">
              <div class="deep-search-result__media">
                ${renderMedia(result, layout)}
              </div>

              <div class="deep-search-result__body">
                <div class="deep-search-result__meta-row">
                  <span>${recordId}</span>
                  <span>${date}</span>
                </div>

                <h3>${title}</h3>

                <div class="deep-search-result__tags">
                  ${tag}
                  ${severity}
                  ${type}
                </div>

                ${excerpt}
                ${summary}

                <div class="deep-search-result__footer">
                  <span class="deep-search-result__cta">OPEN_FILE</span>
                </div>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join("");
  };

  const runSearch = async () => {
    syncUrl();
    renderFilters();
    renderSuggestions();

    if (!state.query) {
      renderIdle();
      return;
    }

    const filters = activeFilters();
    const options = Object.keys(filters).length > 0 ? { filters } : {};

    setStatus(0, true);

    try {
      const response = await pagefind.search(state.query, options);
      const results = await Promise.all(response.results.map((match) => match.data()));

      setStatus(results.length);

      if (results.length === 0) {
        renderEmpty("No declassified files matched the current query and filter set.");
        return;
      }

      renderResults(results);
    } catch (error) {
      statusRoot.textContent = "QUERY_ID: ERROR // SEARCH_UNAVAILABLE";
      renderEmpty("Search failed to initialize. Rebuild the Pagefind index and try again.");
      console.error(error);
    }
  };

  const scheduleSearch = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      void runSearch();
    }, 160);
  };

  queryInput.addEventListener("input", () => {
    state.query = queryInput.value.trim();
    scheduleSearch();
  });

  queryInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    state.query = queryInput.value.trim();
    void runSearch();
  });

  submitButton.addEventListener("click", () => {
    state.query = queryInput.value.trim();
    void runSearch();
  });

  filterToggle.addEventListener("click", () => {
    state.filtersOpen = !state.filtersOpen;
    updateControls();
    renderFilters();
  });

  sortButton.addEventListener("click", () => {
    const index = sortModes.indexOf(state.sort);
    state.sort = sortModes[(index + 1) % sortModes.length];
    updateControls();
    void runSearch();
  });

  filtersRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-key]");

    if (!button) {
      return;
    }

    const { filterKey, filterValue } = button.dataset;
    state.filters[filterKey] = state.filters[filterKey] === filterValue ? "" : filterValue;
    state.filtersOpen = activeFilterCount() > 0 || state.filtersOpen;
    updateControls();
    renderFilters();
    renderSuggestions();
    void runSearch();
  });

  suggestionsRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-suggestion-value]");

    if (!button) {
      return;
    }

    const value = button.dataset.suggestionValue;
    state.filters.tag = state.filters.tag === value ? "" : value;
    if (!state.query) {
      state.query = value.replace(/-/g, " ");
      queryInput.value = state.query.toUpperCase();
    }
    state.filtersOpen = activeFilterCount() > 0;
    updateControls();
    renderSuggestions();
    renderFilters();
    void runSearch();
  });

  const initialize = async () => {
    try {
      pagefind = await import(pagefindJsUrl);
      await pagefind.options({ bundlePath: pagefindBaseUrl });
      filterIndex = await pagefind.filters();
      updateControls();
      renderSuggestions();
      renderFilters();
      await runSearch();
    } catch (error) {
      statusRoot.textContent = "QUERY_ID: ERROR // SEARCH_UNAVAILABLE";
      renderEmpty("Search assets are missing. Run `npm run build` to generate the Pagefind index.");
      console.error(error);
    }
  };

  void initialize();
})();

(function () {
  const filtersRoot = document.getElementById("entries-filter-groups");
  const activeFiltersRoot = document.getElementById("entries-active-filters");
  const statusRoot = document.getElementById("entries-status");
  const emptyRoot = document.getElementById("entries-empty");
  const listRoot = document.getElementById("entries-list");
  const sortButtons = Array.from(document.querySelectorAll("[data-sort]"));
  const cards = Array.from(document.querySelectorAll("[data-entry-card]"));

  if (!filtersRoot || !activeFiltersRoot || !statusRoot || !emptyRoot || !listRoot || cards.length === 0) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };

  const cardTags = new Map();
  const tagCounts = new Map();
  const typeCounts = new Map();
  const severityCounts = new Map();

  const readList = (value) =>
    (value || "")
      .split("|")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

  for (const card of cards) {
    const tags = readList(card.dataset.entryTags);
    const type = (card.dataset.entryType || "").trim().toLowerCase();
    const severity = (card.dataset.entrySeverity || "").trim().toLowerCase();

    cardTags.set(card, tags);

    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    if (type) {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    if (severity) {
      severityCounts.set(severity, (severityCounts.get(severity) || 0) + 1);
    }
  }

  const tags = Array.from(tagCounts.keys()).sort((left, right) => left.localeCompare(right));
  const types = Array.from(typeCounts.keys()).sort((left, right) => left.localeCompare(right));
  const severities = Array.from(severityCounts.keys()).sort((left, right) => {
    return (severityRank[right] || 0) - (severityRank[left] || 0);
  });

  const requestedTags = (params.get("tag") || params.get("category") || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => tagCounts.has(value));

  const state = {
    selectedTags: new Set(requestedTags.length > 0 ? requestedTags : tags),
    selectedType: ((params.get("type") || "").trim().toLowerCase()),
    selectedSeverity: ((params.get("severity") || "").trim().toLowerCase()),
    sort: params.get("sort") || "date"
  };

  if (!types.includes(state.selectedType)) {
    state.selectedType = "";
  }

  if (!severities.includes(state.selectedSeverity)) {
    state.selectedSeverity = "";
  }

  const allowedSorts = new Set(sortButtons.map((button) => button.dataset.sort).filter(Boolean));

  if (!allowedSorts.has(state.sort)) {
    state.sort = "date";
  }

  const formatLabel = (value) =>
    value
      .split("-")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");

  const allTagsSelected = () => state.selectedTags.size === tags.length;

  const syncUrl = () => {
    const next = new URLSearchParams();

    if (!allTagsSelected() && state.selectedTags.size > 0) {
      next.set("tag", Array.from(state.selectedTags).sort().join(","));
    }

    if (state.selectedType) {
      next.set("type", state.selectedType);
    }

    if (state.selectedSeverity) {
      next.set("severity", state.selectedSeverity);
    }

    if (state.sort !== "date") {
      next.set("sort", state.sort);
    }

    const query = next.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  };

  const compareCards = (left, right) => {
    if (state.sort === "severity") {
      const leftRank = severityRank[left.dataset.entrySeverity || ""] || 0;
      const rightRank = severityRank[right.dataset.entrySeverity || ""] || 0;

      if (leftRank !== rightRank) {
        return rightRank - leftRank;
      }
    }

    return (right.dataset.entryDate || "").localeCompare(left.dataset.entryDate || "");
  };

  const renderSortButtons = () => {
    for (const button of sortButtons) {
      button.classList.toggle("is-active", button.dataset.sort === state.sort);
    }
  };

  const renderTagButtons = () => {
    const buttons = tags.map((tag) => `
      <button
        class="archive-files-filter${state.selectedTags.has(tag) ? " is-active" : ""}"
        type="button"
        data-tag="${tag}"
        aria-pressed="${state.selectedTags.has(tag) ? "true" : "false"}"
      >
        <span>${formatLabel(tag)}</span>
        <span class="archive-files-filter__count">${tagCounts.get(tag) || 0}</span>
      </button>
    `).join("");

    return `
      <section class="archive-files-filter-group">
        <div class="archive-files-filter-group__head">
          <h3>TAG_VECTORS</h3>
          <div class="archive-files-filter-group__utilities">
            <button
              class="archive-files-filter${allTagsSelected() ? " is-active" : ""}"
              type="button"
              data-filter-action="all-tags"
              aria-pressed="${allTagsSelected() ? "true" : "false"}"
            >
              ALL
            </button>
            <button
              class="archive-files-filter${state.selectedTags.size === 0 ? " is-active" : ""}"
              type="button"
              data-filter-action="clear-tags"
              aria-pressed="${state.selectedTags.size === 0 ? "true" : "false"}"
            >
              CLEAR
            </button>
          </div>
        </div>
        <div class="archive-files-filter-buttons">${buttons}</div>
      </section>
    `;
  };

  const renderSingleGroup = (title, values, selectedValue, dataKey, counts) => {
    if (values.length === 0) {
      return "";
    }

    const buttons = values.map((value) => `
      <button
        class="archive-files-filter${selectedValue === value ? " is-active" : ""}"
        type="button"
        data-${dataKey}="${value}"
        aria-pressed="${selectedValue === value ? "true" : "false"}"
      >
        <span>${formatLabel(value)}</span>
        <span class="archive-files-filter__count">${counts.get(value) || 0}</span>
      </button>
    `).join("");

    return `
      <section class="archive-files-filter-group">
        <div class="archive-files-filter-group__head">
          <h3>${title}</h3>
        </div>
        <div class="archive-files-filter-buttons">${buttons}</div>
      </section>
    `;
  };

  const renderFilters = () => {
    filtersRoot.innerHTML = [
      renderTagButtons(),
      renderSingleGroup("FORMAT", types, state.selectedType, "type", typeCounts),
      renderSingleGroup("SEVERITY", severities, state.selectedSeverity, "severity", severityCounts)
    ].join("");
  };

  const renderActiveFilters = () => {
    const chips = [];

    if (allTagsSelected()) {
      chips.push('<span class="archive-files-active-chip archive-files-active-chip--static">ALL_TAGS</span>');
    } else if (state.selectedTags.size === 0) {
      chips.push('<span class="archive-files-active-chip archive-files-active-chip--static">NO_TAGS</span>');
    } else {
      for (const tag of Array.from(state.selectedTags).sort()) {
        chips.push(`
          <button class="archive-files-active-chip" type="button" data-remove-tag="${tag}">
            ${formatLabel(tag)}
            <span aria-hidden="true">×</span>
          </button>
        `);
      }
    }

    if (state.selectedType) {
      chips.push(`
        <button class="archive-files-active-chip" type="button" data-clear-type="true">
          TYPE: ${formatLabel(state.selectedType)}
          <span aria-hidden="true">×</span>
        </button>
      `);
    }

    if (state.selectedSeverity) {
      chips.push(`
        <button class="archive-files-active-chip" type="button" data-clear-severity="true">
          SEVERITY: ${formatLabel(state.selectedSeverity)}
          <span aria-hidden="true">×</span>
        </button>
      `);
    }

    activeFiltersRoot.innerHTML = chips.join("");
  };

  const renderState = () => {
    let visibleCount = 0;
    const visibleCards = [];

    for (const card of cards) {
      const tagsForCard = cardTags.get(card) || [];
      const matchesTags = state.selectedTags.size > 0 && tagsForCard.some((tag) => state.selectedTags.has(tag));
      const matchesType = !state.selectedType || card.dataset.entryType === state.selectedType;
      const matchesSeverity = !state.selectedSeverity || card.dataset.entrySeverity === state.selectedSeverity;
      const visible = matchesTags && matchesType && matchesSeverity;

      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
        visibleCards.push(card);
      }
    }

    visibleCards.sort(compareCards).forEach((card) => {
      listRoot.appendChild(card);
    });

    emptyRoot.hidden = visibleCount !== 0;

    if (state.selectedTags.size === 0) {
      statusRoot.textContent = "No tags selected.";
      return;
    }

    const clauses = [`Showing ${visibleCount} file${visibleCount === 1 ? "" : "s"}`];

    if (!allTagsSelected()) {
      clauses.push(`across ${state.selectedTags.size} active tag${state.selectedTags.size === 1 ? "" : "s"}`);
    } else {
      clauses.push("across all tags");
    }

    if (state.selectedType) {
      clauses.push(`filtered to ${formatLabel(state.selectedType)} format`);
    }

    if (state.selectedSeverity) {
      clauses.push(`at ${formatLabel(state.selectedSeverity)} severity`);
    }

    statusRoot.textContent = `${clauses.join(" ")}.`;
  };

  filtersRoot.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    const action = button.dataset.filterAction;
    const tag = button.dataset.tag;
    const type = button.dataset.type;
    const severity = button.dataset.severity;

    if (action === "all-tags") {
      state.selectedTags = new Set(tags);
    } else if (action === "clear-tags") {
      state.selectedTags = new Set();
    } else if (tag) {
      if (state.selectedTags.has(tag)) {
        state.selectedTags.delete(tag);
      } else {
        state.selectedTags.add(tag);
      }
    } else if (type) {
      state.selectedType = state.selectedType === type ? "" : type;
    } else if (severity) {
      state.selectedSeverity = state.selectedSeverity === severity ? "" : severity;
    }

    renderFilters();
    renderActiveFilters();
    renderState();
    syncUrl();
  });

  activeFiltersRoot.addEventListener("click", (event) => {
    const removeTag = event.target.closest("[data-remove-tag]");
    const clearType = event.target.closest("[data-clear-type]");
    const clearSeverity = event.target.closest("[data-clear-severity]");

    if (removeTag) {
      state.selectedTags.delete(removeTag.dataset.removeTag);
    } else if (clearType) {
      state.selectedType = "";
    } else if (clearSeverity) {
      state.selectedSeverity = "";
    } else {
      return;
    }

    renderFilters();
    renderActiveFilters();
    renderState();
    syncUrl();
  });

  for (const button of sortButtons) {
    button.addEventListener("click", () => {
      state.sort = button.dataset.sort || "date";
      renderSortButtons();
      renderState();
      syncUrl();
    });
  }

  renderSortButtons();
  renderFilters();
  renderActiveFilters();
  renderState();
  syncUrl();
})();

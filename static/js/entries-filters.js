(function () {
  const filtersRoot = document.getElementById("entries-category-filters");
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
  const cardCategories = new Map();
  const categoryCounts = new Map();
  const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };

  for (const card of cards) {
    const categories = (card.dataset.entryCategories || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);

    cardCategories.set(card, categories);

    for (const category of categories) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
  }

  const categories = Array.from(categoryCounts.keys()).sort((left, right) => left.localeCompare(right));
  const requestedCategories = (params.get("category") || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const initialSelection = requestedCategories.length > 0
    ? requestedCategories.filter((value) => categoryCounts.has(value))
    : categories;

  const state = {
    selectedCategories: new Set(initialSelection),
    sort: params.get("sort") || "date"
  };

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

  const allSelected = () => state.selectedCategories.size === categories.length;

  const syncUrl = () => {
    const next = new URLSearchParams();

    if (!allSelected() && state.selectedCategories.size > 0) {
      next.set("category", Array.from(state.selectedCategories).sort().join(","));
    }

    if (state.sort !== "date") {
      next.set("sort", state.sort);
    }

    const query = next.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  };

  const compareCards = (left, right) => {
    if (state.sort === "title") {
      return (left.dataset.entryTitle || "").localeCompare(right.dataset.entryTitle || "");
    }

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

  const renderFilters = () => {
    const utilities = `
      <button
        class="archive-files-filter${allSelected() ? " is-active" : ""}"
        type="button"
        data-filter-action="all"
        aria-pressed="${allSelected() ? "true" : "false"}"
      >
        ALL
      </button>
      <button
        class="archive-files-filter${state.selectedCategories.size === 0 ? " is-active" : ""}"
        type="button"
        data-filter-action="clear"
        aria-pressed="${state.selectedCategories.size === 0 ? "true" : "false"}"
      >
        CLEAR
      </button>
    `;

    const buttons = categories.map((category) => `
      <button
        class="archive-files-filter${state.selectedCategories.has(category) ? " is-active" : ""}"
        type="button"
        data-category="${category}"
        aria-pressed="${state.selectedCategories.has(category) ? "true" : "false"}"
      >
        <span>${formatLabel(category)}</span>
        <span class="archive-files-filter__count">${categoryCounts.get(category) || 0}</span>
      </button>
    `);

    filtersRoot.innerHTML = utilities + buttons.join("");
  };

  const renderActiveFilters = () => {
    if (allSelected()) {
      activeFiltersRoot.innerHTML = `
        <span class="archive-files-active-chip archive-files-active-chip--static">ALL_CATEGORIES</span>
      `;
      return;
    }

    if (state.selectedCategories.size === 0) {
      activeFiltersRoot.innerHTML = `
        <span class="archive-files-active-chip archive-files-active-chip--static">NO_CATEGORIES</span>
      `;
      return;
    }

    activeFiltersRoot.innerHTML = Array.from(state.selectedCategories)
      .sort()
      .map((category) => `
        <button class="archive-files-active-chip" type="button" data-remove-category="${category}">
          ${formatLabel(category)}
          <span aria-hidden="true">×</span>
        </button>
      `)
      .join("");
  };

  const renderState = () => {
    let visibleCount = 0;
    const visibleCards = [];

    for (const card of cards) {
      const categoriesForCard = cardCategories.get(card) || [];
      const visible =
        state.selectedCategories.size > 0 &&
        categoriesForCard.some((category) => state.selectedCategories.has(category));

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

    if (allSelected()) {
      statusRoot.textContent = `Showing all ${visibleCount} published file${visibleCount === 1 ? "" : "s"}.`;
      return;
    }

    if (state.selectedCategories.size === 0) {
      statusRoot.textContent = "No categories selected.";
      return;
    }

    statusRoot.textContent = `Showing ${visibleCount} file${visibleCount === 1 ? "" : "s"} across ${state.selectedCategories.size} active categor${state.selectedCategories.size === 1 ? "y" : "ies"}.`;
  };

  filtersRoot.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    const action = button.dataset.filterAction;
    const category = button.dataset.category;

    if (action === "all") {
      state.selectedCategories = new Set(categories);
    } else if (action === "clear") {
      state.selectedCategories = new Set();
    } else if (category) {
      if (state.selectedCategories.has(category)) {
        state.selectedCategories.delete(category);
      } else {
        state.selectedCategories.add(category);
      }
    }

    renderFilters();
    renderActiveFilters();
    renderState();
    syncUrl();
  });

  activeFiltersRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-category]");

    if (!button) {
      return;
    }

    state.selectedCategories.delete(button.dataset.removeCategory);
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

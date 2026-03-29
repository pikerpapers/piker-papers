(() => {
  const header = document.querySelector(".site-header");

  if (!header || typeof window.Headroom === "undefined") {
    return;
  }

  const collapseOffset = 24;
  const expandTolerance = 20;
  const shortPageRangeThreshold = 220;

  let headroom;
  let shortPageMode = false;
  let collapseAnchorY = 0;
  let ticking = false;

  const syncOffset = () => {
    document.documentElement.style.setProperty(
      "--header-offset",
      `${header.offsetHeight}px`
    );
  };

  const scrollRange = () =>
    Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

  const ensureHeadroom = () => {
    if (headroom) {
      return;
    }

    headroom = new window.Headroom(header, {
      offset: collapseOffset,
      tolerance: {
        up: expandTolerance,
        down: 0,
      },
      classes: {
        initial: "is-headroom",
        pinned: "is-expanded",
        unpinned: "is-collapsed",
        top: "is-top",
        notTop: "is-not-top",
        bottom: "is-bottom",
        notBottom: "is-not-bottom",
        frozen: "is-frozen",
      },
    });

    headroom.init();
  };

  const destroyHeadroom = () => {
    if (!headroom) {
      return;
    }

    headroom.destroy();
    headroom = undefined;
  };

  const applyShortPageState = () => {
    const currentY = window.scrollY;
    const isCollapsed = header.classList.contains("is-collapsed");

    if (!isCollapsed && currentY > collapseOffset) {
      header.classList.add("is-collapsed");
      collapseAnchorY = currentY;
    } else if (isCollapsed) {
      collapseAnchorY = Math.max(collapseAnchorY, currentY);

      if (currentY <= Math.max(0, collapseAnchorY - expandTolerance)) {
        header.classList.remove("is-collapsed");
        collapseAnchorY = 0;
      }
    }

    if (currentY <= 0) {
      header.classList.remove("is-collapsed");
      collapseAnchorY = 0;
    }
  };

  const syncMode = () => {
    const nextShortPageMode = scrollRange() <= shortPageRangeThreshold;

    if (nextShortPageMode === shortPageMode) {
      return;
    }

    shortPageMode = nextShortPageMode;

    if (shortPageMode) {
      destroyHeadroom();
      applyShortPageState();
      syncOffset();
      return;
    }

    collapseAnchorY = 0;
    ensureHeadroom();
  };

  const onScroll = () => {
    if (!shortPageMode || ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      applyShortPageState();
      syncOffset();
      ticking = false;
    });
  };

  syncOffset();
  syncMode();
  if (!shortPageMode) {
    ensureHeadroom();
  }

  const headerResizeObserver = new ResizeObserver(() => {
    syncOffset();
  });

  headerResizeObserver.observe(header);

  const pageResizeObserver = new ResizeObserver(() => {
    syncMode();
    if (shortPageMode) {
      applyShortPageState();
      syncOffset();
    }
  });

  pageResizeObserver.observe(document.body);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", syncOffset, { once: true });
  window.addEventListener("resize", () => {
    syncMode();
    syncOffset();
  }, { passive: true });
})();

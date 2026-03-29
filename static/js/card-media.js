(function () {
  const cards = Array.from(document.querySelectorAll("[data-card-video-url]"));

  if (cards.length === 0) {
    return;
  }

  const getVideoIdFromUrl = (url) => {
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/^\/+/, "");

    if (host === "youtu.be") {
      return path.split("/")[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (path === "watch") {
        return url.searchParams.get("v");
      }
      if (path.startsWith("embed/")) {
        return path.split("/")[1] || null;
      }
      if (path.startsWith("shorts/")) {
        return path.split("/")[1] || null;
      }
      if (path.startsWith("live/")) {
        return path.split("/")[1] || null;
      }
    }

    return null;
  };

  for (const card of cards) {
    const urlText = card.dataset.cardVideoUrl || "";
    const label = card.dataset.cardVideoLabel || "Video clip";
    const frame = card.querySelector(
      ".entry-card__media-frame, .feature-panel__media-frame, .dossier-hero__media-frame, .intel-source-card__media-frame"
    );

    if (!frame) {
      continue;
    }

    let url;
    try {
      url = new URL(urlText);
    } catch {
      continue;
    }

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      continue;
    }

    const image = document.createElement("img");
    image.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    image.alt = `${label} thumbnail`;
    image.loading = "lazy";
    image.referrerPolicy = "strict-origin-when-cross-origin";

    frame.innerHTML = "";
    frame.appendChild(image);
  }
})();

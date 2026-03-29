(function () {
  const nodes = Array.from(document.querySelectorAll(".video-source"));
  if (nodes.length === 0) {
    return;
  }

  const toNumber = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const parseTimeToken = (rawValue) => {
    if (!rawValue) return 0;
    const value = String(rawValue).trim().toLowerCase();
    if (!value) return 0;
    if (/^\d+$/.test(value)) return toNumber(value);

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (!match) return 0;
    const hours = toNumber(match[1] || "0");
    const minutes = toNumber(match[2] || "0");
    const seconds = toNumber(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  };

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

  const getTimestampFromUrl = (url) => {
    const tParam = url.searchParams.get("t");
    const startParam = url.searchParams.get("start");
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : "";

    if (startParam) return parseTimeToken(startParam);
    if (tParam) return parseTimeToken(tParam);

    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const hashT = hashParams.get("t");
      const hashStart = hashParams.get("start");
      if (hashStart) return parseTimeToken(hashStart);
      if (hashT) return parseTimeToken(hashT);
      if (hash.startsWith("t=")) return parseTimeToken(hash.slice(2));
    }

    return 0;
  };

  const createEmbed = (videoId, startSeconds, label) => {
    const wrapper = document.createElement("div");
    wrapper.className = "video-source__frame";

    const iframe = document.createElement("iframe");
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1"
    });
    if (startSeconds > 0) {
      params.set("start", String(startSeconds));
    }

    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    iframe.title = `YouTube playback: ${label || "Video source"}`;
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";

    wrapper.appendChild(iframe);
    return wrapper;
  };

  for (const node of nodes) {
    const urlText = node.dataset.videoUrl || "";
    const label = node.dataset.videoLabel || "Video source";
    const explicitStart = toNumber(node.dataset.start || "0");

    let url;
    try {
      url = new URL(urlText);
    } catch {
      node.innerHTML = '<p class="video-source__fallback">Video URL is invalid.</p>';
      continue;
    }

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      node.innerHTML =
        '<p class="video-source__fallback">Inline playback supports YouTube links only. Use the source link above.</p>';
      continue;
    }

    const parsedStart = getTimestampFromUrl(url);
    const startSeconds = explicitStart > 0 ? explicitStart : parsedStart;

    node.innerHTML = "";
    node.appendChild(createEmbed(videoId, startSeconds, label));
  }
})();

(function () {
    "use strict";

    const warning = "Warning:\nThis YouTube video does not allow embedding.\nPlease choose another video.";

    function getYouTubeId(url) {
        try {
            const parsed = new URL(url, window.location.href);
            const host = parsed.hostname.replace(/^www\./, "");

            if (host === "youtu.be") {
                return parsed.pathname.split("/").filter(Boolean)[0] || "";
            }

            if (host === "youtube.com" || host === "youtube-nocookie.com") {
                if (parsed.pathname === "/watch") {
                    return parsed.searchParams.get("v") || "";
                }

                const embedMatch = parsed.pathname.match(/\/embed\/([^/?#]+)/);
                if (embedMatch) {
                    return embedMatch[1];
                }
            }
        } catch (error) {
            return "";
        }

        return "";
    }

    function standardizeYouTubeIframe(iframe) {
        const originalSource = iframe.getAttribute("src") || "";
        const videoId = getYouTubeId(originalSource);

        if (!videoId) {
            return;
        }

        iframe.setAttribute("src", `https://www.youtube-nocookie.com/embed/${videoId}`);
        iframe.setAttribute("title", "Lesson Video");
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        iframe.addEventListener("error", () => console.warn(warning));
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("iframe[src*='youtube.com'], iframe[src*='youtube-nocookie.com'], iframe[src*='youtu.be']").forEach(standardizeYouTubeIframe);
    });
})();

// Ivory gallery page — reads window.IVORY (set from _data/event.yml).
// Backend contract: GET {gallery_photos}?limit=&after=  ->  { photos: [{id, thumbnailUrl, width, height}], nextCursor }
//                   GET {gallery_photos}/{id}           ->  { displayUrl, thumbnailUrl }
(() => {
  const config = window.IVORY || {};
  const galleryGrid = document.querySelector("#gallery-grid");
  if (!galleryGrid) return;

  const photosPath = config.endpoints?.gallery_photos || "gallery/photos";
  const galleryStatus = document.querySelector("#gallery-status");
  const refreshGallery = document.querySelector("#gallery-refresh");
  const loadMorePhotos = document.querySelector("#gallery-more");
  const photoViewer = document.querySelector("#photo-viewer");
  const photoViewerImage = document.querySelector("#photo-viewer-image");
  const closePhotoViewer = document.querySelector("#gallery-close");
  const knownPhotos = new Set();
  let nextGalleryCursor = null;
  let galleryLoading = false;

  async function galleryRequest(path) {
    const response = await fetch(`${config.apiBase}${path}`, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error?.message || "The gallery is temporarily unavailable. Please try again.");
      error.status = response.status;
      throw error;
    }
    return result;
  }

  const photoPath = (id) => `${photosPath}/${encodeURIComponent(id)}`;

  function addPhoto(photo) {
    if (knownPhotos.has(photo.id)) return;
    knownPhotos.add(photo.id);

    const button = document.createElement("button");
    button.className = "gallery-photo";
    button.type = "button";
    button.setAttribute("aria-label", "View photo");

    const image = document.createElement("img");
    image.src = photo.thumbnailUrl;
    image.alt = "";
    image.loading = "lazy";
    if (photo.width) image.width = photo.width;
    if (photo.height) image.height = photo.height;
    button.append(image);

    const forget = () => {
      button.remove();
      knownPhotos.delete(photo.id);
    };

    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const full = await galleryRequest(photoPath(photo.id));
        photoViewerImage.src = full.displayUrl;
        photoViewer.showModal();
      } catch (error) {
        galleryStatus.textContent = error.message;
        if (error.status === 404) forget();
      } finally {
        button.disabled = false;
      }
    });

    // Signed image URLs expire; refresh once a minute at most.
    let refreshedAt = 0;
    image.addEventListener("error", async () => {
      if (Date.now() - refreshedAt < 60_000) return;
      refreshedAt = Date.now();
      try {
        image.src = (await galleryRequest(photoPath(photo.id))).thumbnailUrl;
      } catch (error) {
        if (error.status === 404) forget();
      }
    });

    galleryGrid.append(button);
  }

  async function loadGallery(reset = false) {
    if (galleryLoading) return;
    galleryLoading = true;
    refreshGallery.disabled = true;
    loadMorePhotos.disabled = true;

    try {
      const query = new URLSearchParams({ limit: "20" });
      if (!reset && nextGalleryCursor) query.set("after", nextGalleryCursor);
      const result = await galleryRequest(`${photosPath}?${query}`);
      if (!Array.isArray(result.photos)) throw new Error("The gallery response was not in the expected format.");

      if (reset) {
        galleryGrid.replaceChildren();
        knownPhotos.clear();
      }
      result.photos.forEach(addPhoto);
      nextGalleryCursor = result.nextCursor;
      loadMorePhotos.hidden = !nextGalleryCursor;
      galleryStatus.textContent = knownPhotos.size
        ? `${knownPhotos.size} ${knownPhotos.size === 1 ? "photo" : "photos"}`
        : "The first memories will appear here soon.";
    } catch (error) {
      console.error("Unable to load gallery photos:", error);
      galleryStatus.textContent = error.message;
    } finally {
      galleryLoading = false;
      refreshGallery.disabled = false;
      loadMorePhotos.disabled = false;
    }
  }

  refreshGallery.addEventListener("click", () => loadGallery(true));
  loadMorePhotos.addEventListener("click", () => loadGallery());
  closePhotoViewer.addEventListener("click", () => photoViewer.close());
  photoViewer.addEventListener("close", () => photoViewerImage.removeAttribute("src"));
  photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) photoViewer.close();
  });

  loadGallery(true);
})();

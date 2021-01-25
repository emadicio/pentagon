/*
 * Utility to preload images
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach((imageUrl) => {
    const image = new Image();
    image.src = imageUrl;
  });
};

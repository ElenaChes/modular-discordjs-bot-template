//[Imports]
const { AttachmentBuilder, ThumbnailBuilder, FileBuilder, MediaGalleryItemBuilder, MediaGalleryBuilder } = require("discord.js");

module.exports = ({ utilsLib }) => {
  const MAX_GALLERY_ITEMS = 50;

  //[Build attachment from file path (local or url)]
  utilsLib.makeAttachment = (filePath, data = {}) => new AttachmentBuilder(filePath, data);

  //[Build thumbnail]
  utilsLib.makeThumbnail = (url, { desc } = {}) => {
    const thumbnail = new ThumbnailBuilder().setURL(url);
    if (desc) thumbnail.setDescription(desc);
    return thumbnail;
  };

  //[Build file attachment]
  utilsLib.makeFile = (url, { spoiler = false } = {}) => new FileBuilder().setURL(url).setSpoiler(spoiler);

  //[Build media gallery item]
  utilsLib.makeGalleryItem = (url, { desc, spoiler = false } = {}) => {
    const galleryItem = new MediaGalleryItemBuilder().setURL(url).setSpoiler(spoiler);
    if (desc) galleryItem.setDescription(desc);
    return galleryItem;
  };

  //[Build media gallery]
  utilsLib.makeMediaGallery = (galleryItems) => {
    if (galleryItems.length > MAX_GALLERY_ITEMS)
      utilsLib.warn(`MakeMediaGallery`, `Received ${galleryItems.length} items (max ${MAX_GALLERY_ITEMS}).`);

    const mediaGallery = new MediaGalleryBuilder();
    galleryItems?.slice(0, MAX_GALLERY_ITEMS).forEach((i) => mediaGallery.addItems(i));
    return mediaGallery;
  };
};

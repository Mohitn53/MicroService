const imagekit = require("../config/imagekit");

const uploadImageToImageKit = async (fileBuffer, originalName) => {
  const response = await imagekit.upload({
    file: fileBuffer, // Buffer
    fileName: originalName,
    folder: "/products",
  });

  return {
    url: response.url,
    thumbnail: imagekit.url({
      src: response.url,
      transformation: [{ height: 300, width: 300 }],
    }),
    publicId: response.fileId,
  };
};

module.exports = uploadImageToImageKit;

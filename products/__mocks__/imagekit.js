module.exports = function ImageKit() {
  return {
    upload: jest.fn().mockResolvedValue({
      url: "https://fake.imagekit.io/product.jpg",
      fileId: "fake-file-id",
    }),
    url: jest.fn().mockReturnValue(
      "https://fake.imagekit.io/product_thumb.jpg"
    ),
  };
};

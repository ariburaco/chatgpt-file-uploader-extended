import Tesseract from "tesseract.js";

class OCRImage {
  image: File | Blob | string;

  constructor(image: File | Blob | string) {
    this.image = image;
  }

  async getText() {
    await Tesseract.createWorker({
      logger: (message) => {
        console.log("message", message);
      },
    });

    const result = await Tesseract.recognize(this.image);
    return result.data.text;
  }
}

export default OCRImage;

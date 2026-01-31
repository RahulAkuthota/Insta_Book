import QRCode from "qrcode";

const generateQRCode = async (payload) => {
  return await QRCode.toDataURL(payload);
};

export { generateQRCode }

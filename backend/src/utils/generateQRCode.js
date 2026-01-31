import QRCode from "qrcode";

export const generateQRCode = async (payload) => {
  return await QRCode.toDataURL(payload);
};

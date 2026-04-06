const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("./app-error");

const MAX_CV_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ensureUploadDir = (folderName = "default") => {
  const root = path.resolve(process.cwd(), "uploads");
  const target = path.join(root, folderName);

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  return target;
};

const sanitizeFileBaseName = (filename) => {
  const base = path.parse(filename).name;
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "cv";
};

const createPdfUploader = (folderName = "default") => {
  const targetDir = ensureUploadDir(folderName);

  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, targetDir);
    },
    filename: (_req, file, callback) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const safeBaseName = sanitizeFileBaseName(file.originalname);
      callback(null, `${timestamp}-${random}-${safeBaseName}.pdf`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_CV_FILE_SIZE_BYTES,
    },
    fileFilter: (_req, file, callback) => {
      if (file.mimetype !== "application/pdf") {
        callback(new AppError(StatusCodes.BAD_REQUEST, "Chi ho tro file CV dinh dang PDF"));
        return;
      }

      callback(null, true);
    },
  });
};

exports.uploadHandler = {
  ensureUploadDir,
  createPdfUploader,
  MAX_CV_FILE_SIZE_BYTES,
};

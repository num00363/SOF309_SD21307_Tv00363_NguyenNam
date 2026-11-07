import { createServer } from "node:http";
import { readFile, stat } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendError(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(message);
}

function serveStaticFile(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendError(response, 405, "Phương thức yêu cầu không được hỗ trợ.");
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendError(response, 400, "Đường dẫn không hợp lệ.");
    return;
  }

  const requestedPath = (decodedPath === "/" || decodedPath === "/index.html") ? "/html/index.html" : (decodedPath.endsWith(".html") && !decodedPath.startsWith("/html/")) ? "/html" + decodedPath : decodedPath;
  const filePath = resolve(projectRoot, `.${requestedPath}`);
  const relativePath = relative(projectRoot, filePath);
  if (
    relativePath.startsWith(`..${sep}`) ||
    relativePath === ".." ||
    relativePath.startsWith(".") ||
    !mimeTypes[extname(filePath).toLowerCase()]
  ) {
    sendError(response, 404, "Không tìm thấy trang.");
    return;
  }

  stat(filePath, (statError, fileInfo) => {
    if (statError || !fileInfo.isFile()) {
      sendError(response, 404, "Không tìm thấy trang.");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": fileInfo.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()],
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    readFile(filePath, (readError, content) => {
      if (readError) {
        if (!response.headersSent) sendError(response, 500, "Không đọc được trang.");
        else response.destroy(readError);
        return;
      }
      response.end(content);
    });
  });
}

const server = createServer((request, response) => {
  let requestUrl;
  try {
    requestUrl = new URL(request.url || "/", "http://localhost");
  } catch {
    sendError(response, 400, "Yêu cầu không hợp lệ.");
    return;
  }
  serveStaticFile(request, response, requestUrl.pathname);
});

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là một cổng hợp lệ từ 1 đến 65535.");
}

server.listen(port, host, () => {
  console.info(`iStore đang chạy tại http://${host}:${port}`);
});

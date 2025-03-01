const http = require("http");
const { URL } = require("url");

const bodyParser = require("./helpers/bodyParser");
const routes = require("./routes");

const server = http.createServer((request, response) => {
  const parsedUrl = new URL(`http://localhost:3333${request.url}`);

  let { pathname } = parsedUrl;
  let id = null;

  const splittedEndpoint = pathname.split("/").filter(Boolean);

  if (splittedEndpoint.length > 1) {
    pathname = `/${splittedEndpoint[0]}/:id`;
    id = splittedEndpoint[1];
  }

  const route = routes.find(
    (routeObj) =>
      routeObj.endpoint === pathname && routeObj.method === request.method
  );

  if (route) {
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { "Content-Type": "application/json" });
      response.end(JSON.stringify(body));
    };

    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response));
    } else {
      route.handler(request, response);
    }
  } else {
    response.writeHead(404, { "Content-Type": "text/html" });
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`);
  }
});

server.listen(3333, () => {
  console.log("🔥 Server is running on http://localhost:3333");
});

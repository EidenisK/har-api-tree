/**
 * generate HTML collapsible with given title and content
 * @param {*} title
 * @param {*} content
 * @param {*} params: fontSize, open
 * @returns
 */
function getCollapsible(title, content, params) {
  let open = params?.open ? " open" : "";
  return `<details${open}>
        <summary style="font-size: ${
          params?.fontSize ?? 12
        }pt">${title}</summary>
        ${content}
    </details>`;
}

/**
 * Prepares an object for display in HTML (removes special characters, trims, enforces 10k symbol limit, etc.)
 * @param {*} obj
 * @returns stringified object
 */
function prepareObject(obj) {
  let str = JSON.stringify(obj, null, 2);
  str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  str = str.substring(0, 10000) + (str.length > 10000 ? "..." : "");
  str = str.trim();
  return str;
}

/**
 * Displays all provided requests in the table
 * @param {*} requests
 * @param {*} groupSimilar - if true, will mark similar requests with (xN), where N is the number of similar requests
 */
function showRequests(requests, groupSimilar = false) {
  let html = "";

  let existingRequests = [];
  let idx = 0;

  if (groupSimilar) {
    for (const request of requests) {
      let strRequest = JSON.stringify(request);

      let similar = existingRequests.find(
        (req) => stringSimilarity.compareTwoStrings(req.str, strRequest) > 0.95
      );
      if (similar) {
        similar.count++;
      } else {
        existingRequests.push({
          str: strRequest,
          obj: request,
          count: 1,
        });
      }
    }
  } else {
    existingRequests = requests.map((req) => ({
      str: JSON.stringify(req),
      obj: req,
      count: 1,
    }));
  }

  for (const req of existingRequests) {
    let request = req.obj;
    let countStr = req.count > 1 ? ` (x${req.count})` : "";

    let method, url, headers, queryString, postData;
    let respHeaders, respContent, decodedRespContent;

    try {
      method = request.request.method;
      url = request.request.url;
      headers = request.request.headers;
      queryString = request.request.queryString;

      postData;
      try {
        postData = JSON.parse(request.request.postData.text);
      } catch (err) {
        postData = request.request?.postData?.text;
      }

      respHeaders = request.response.headers;
      respContent = request.response.content.text;
      respEnc = request.response.content.encoding;
      decodedRespContent = JSON.parse(
        respEnc == "base64" ? atob(respContent) : respContent
      );
    } catch (error) {
      console.error(error);
    }

    let content =
      getCollapsible(
        "Request Headers",
        headers ? prepareObject(headers) : "<i>failed to parse</i>",
        { fontSize: 14 }
      ) +
      (postData
        ? getCollapsible("Request Data", prepareObject(postData), {
            fontSize: 14,
            open: true,
          })
        : "") +
      getCollapsible(
        "Response Headers",
        respHeaders ? prepareObject(respHeaders) : "<i>failed to parse</i>",
        { fontSize: 14 }
      ) +
      getCollapsible(
        "Response Data",
        decodedRespContent
          ? prepareObject(decodedRespContent)
          : respContent
          ? respContent
          : "<i>failed to parse</i>",
        { fontSize: 14, open: true }
      ) +
      (request.startedDateTime
        ? `<button onclick="showRaw('${request.startedDateTime}')">Show Raw</button>`
        : "");

    let collapsible = getCollapsible(
      `REQUEST ${idx + 1}: ${method ?? ""} ${url ?? ""}${countStr ?? ""}`,
      content,
      { fontSize: 18, open: existingRequests.length == 1 }
    );
    html += collapsible;
    idx++;
  }
  document.querySelector("#requests").innerHTML = html;
}

/**
 * Displays all requests for a given path
 * @param {*} path
 */
function showRequestsForPath(path) {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }

  let parts = path.split("/");
  let target = tree;
  for (const part of parts) {
    target = target[part];
  }

  showRequests(target.__requests__, true); // group similar
}

/**
 * Displays all requests, in order of execution
 */
function showChronological() {
  showRequests(
    requests
      .sort((a, b) => a.startedDateTime - b.startedDateTime)
      .filter(
        (req) =>
          req.request.url.includes(baseURL)
      )
  );
}

/**
 * Displays one request raw (as parsed JSON)
 * @param {*} requestId
 */
function showRaw(requestId) {
  let req = requests.find((req) => req.startedDateTime == requestId);
  document.querySelector(".popup").style.display = "block";
  document.querySelector(".popup-content").innerHTML = `<pre>${JSON.stringify(
    req,
    null,
    2
  )}</pre>`;
}

/**
 * Hides the raw request popup
 */
function hidePopup() {
  document.querySelector(".popup").style.display = "none";
}

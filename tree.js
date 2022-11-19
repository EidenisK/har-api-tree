/**
 * Generates a tree structure the request collection in variable `requests`
 * @returns
 */
async function getTree() {
  tree = {};
  await readFiles();
  for (const request of requests) {
    let path = request.request.url;
    if (!path.includes(baseURL)) {
      continue;
    }

    let parts = path
      .split("/")
      .filter((part) => part != "https:" && part != "");
    let lastTreeCell = tree;

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (!lastTreeCell[part]) {
        lastTreeCell[part] = {};
      }
      lastTreeCell = lastTreeCell[part];
    }

    if (!lastTreeCell.__requests__?.length) {
      lastTreeCell.__requests__ = [];
    }
    lastTreeCell.__requests__.push(request);
  }

  return tree;
}

/**
 * Gets one tree branch as displayable text
 * @param {*} path
 * @param {*} branch
 * @param {*} tabs
 * @returns
 */
function getTreeBranchText(path, branch, tabs) {
  let pre = "";
  for (const [key, value] of Object.entries(branch)
    .sort((a, b) => a[0] > b[0])
    .filter(([key, value]) => key != "__requests__")) {
    let requests = value.__requests__;
    if (requests) {
      pre += `${tabs}<div class="requestsLink" onclick="showRequestsForPath('${path}/${key}')">${key}</div>\n`;
    } else {
      pre += `${tabs}<div>${key}</div>\n`;
    }

    if (typeof value.length == "undefined") {
      pre += getTreeBranchText(`${path}/${key}`, value, tabs + "\t");
    }
  }
  return pre;
}

/**
 * Displays API tree on screen
 */
async function showTree() {
  await getTree();
  console.log(tree);

  let pre = getTreeBranchText("", tree, "");
  document.querySelector("#tree").innerHTML = pre;
}

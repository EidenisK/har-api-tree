/**
 * displays requests with given query
 */
function search() {
  let query = document.querySelector("#search").value;
  showRequests(
    requests.filter((request) =>
      JSON.stringify(request).toLowerCase().includes(query.toLowerCase())
    )
  );
}

/**
 * Sets base URL for request filtering
 */
function setBaseURL() {
  baseURL = document.querySelector("#baseURL").value;
  showTree();
}
setBaseURL(); // run on document load

/**
 * WIP: toggles between full-text and content search
 */
// function setSearchInData() {
//     searchInData = document.querySelector("#searchInData").checked;
// }

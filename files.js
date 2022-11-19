/**
 * Read .har files (parse requests) - saves them to global variable `requests`
 */
async function readFiles() {
  requests = [];
  const files = [...document.getElementById("files").files];
  let promises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(JSON.parse(reader.result).log.entries);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  });
  requests = (await Promise.all(promises)).flat();
}

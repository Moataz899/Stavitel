/*
  ====================================
  Editor with tailwind html code will export 
  in index.html with user website files
  ====================================
*/

import { getLocal } from "./../helpers/index";

export const exportTemplate = (data) => {
  const { title, description, html } = data;
  let dependencies = getLocal("stavitel-dependencies"); // gram-dependencies

  let dependencyLinks =
    dependencies.length > 0
      ? dependencies
          .map((d) => {
            return `<link rel="stylesheet" href="${d.css}">`;
          })
          .join("\n")
      : "";

  let dependencyScripts =
    dependencies.length > 0
      ? dependencies
          .map((d) => {
            return `<script src="${d.js}"></script>`;
          })
          .join("\n")
      : "";

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title || ""}</title>
        <meta name="title" content="${title || ""}">
        <meta name="description" content="${description || ""}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.2/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/line-awesome/1.3.0/font-awesome-line-awesome/css/all.min.css" />
        ${dependencyLinks}
        <link rel="stylesheet" href="css/global.css" />
        <link rel="stylesheet" href="css/style.css" />
    <body>
        ${html || ""}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.2/js/bootstrap.min.js"></script>
        <script src="js/global.js"></script>
        ${dependencyScripts}
        <script src="js/script.js"></script>
        <!--- generated by Stavitel -->
        </body>
    </html>`;
};

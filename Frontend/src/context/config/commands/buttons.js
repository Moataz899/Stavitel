/*
  =======================================
  Import functions from index.js file
  from helper folder and import notyf
  =======================================
*/

import {
  prepareDeployContent,
  exportZip,
  getGlobalJsCss,
  listOfSites,
  toggleActiveOfDomainList,
  removeSite,
  removeSiteFromNetlify,
  getUrl,
} from "../../helpers/index";
import { Notyf } from "notyf";

// =============  =============
const noty = new Notyf({
  position: { y: "top", x: "center" },
});

// ============= Buttons Function & Commands =============
export default [
  {
    id: "undo",
    className: "fa fa-undo icon-undo",
    command: function (editor, sender) {
      sender.set("active", 0);
      editor.UndoManager.undo(1);
    },
    attributes: {
      title: "Undo (CTRL/CMD + Z)",
    },
  },
  {
    id: "redo",
    className: "fas fa fa-repeat icon-redo",
    command: function (editor, sender) {
      sender.set("active", 0);
      editor.UndoManager.redo(1);
    },
    attributes: {
      title: "Redo (CTRL/CMD + SHIFT + Z)",
    },
  },
  {
    id: "import",
    className: "fa fa-edit",
    command: "html-edit",
    attributes: {
      title: "Import",
    },
  },
  {
    id: "clean-all",
    className: "fa fa-trash icon-blank",
    command: (editor, sender) => {
      if (sender) sender.set("active", false);
      if (confirm("Are you sure to clean the canvas?")) {
        editor.runCommand("core:canvas-clear");
        setTimeout(function () {
          // =------------- add the data in server --------------=
          localStorage.setItem("stjs-assets", "");
          localStorage.setItem("stjs-components", "");
          localStorage.setItem("stjs-html", "");
          localStorage.setItem("stjs-css", "");
          localStorage.setItem("stjs-styles", "");
          localStorage.removeItem("stjs-scripts", "");
          localStorage.removeItem("gram-dependencies", "");
        }, 0);
      }
    },
    attributes: {
      title: "Empty canvas",
    },
  },
  {
    id: "publish",
    className: "fa fa-globe",
    command: (editor, sender) => {
      sender.set("active", 0);

      let modal = editor.Modal;
      modal.setTitle("Deploy");

      // =-------------  --------------=
      const getSEO = localStorage.getItem("gram-seo");
      const { title, description, token } = getSEO
        ? JSON.parse(getSEO)
        : { title: "", description: "" };

        // =-------------  --------------=
      localStorage.setItem("gram-deploying-site", "");

      // ============= Form to set netlify token and host it there =============
      const form = `
            <div class="modal-message"></div>
            <form id="deploy-form" class="gram-form">
                <div class="form-group">
                    <label>Website Title <span class="required">*</span></label>
                    <input type="text" name="title" ${
                      title ? 'value="' + title + '"' : ""
                    } class="form-control">
                </div>
                <div class="form-group">
                    <label>Website Description <span class="required">*</span></label>
                    <textarea name="description" class="form-control">${
                      description || ""
                    }</textarea>
                </div>
                <div class="divider"></div>
                <h4>Netlify</h4>
                <div class="form-group">
                    <label>Netlify Token <span class="required">*</span> <a target="_blank" href="https://app.netlify.com/user/applications#personal-access-tokens"><span class="fa fa-question"></span></a></label>
                    <input type="text" name="token" ${
                      token ? 'value="' + token + '"' : ""
                    } class="form-control">
                </div>
                <div class="form-group existing-form">
                    <div class="deploy-type-radios">
                        <input type="radio" name="deploy" value="new-site" checked> Create a new site <br /> <input type="radio" value="existing" name="deploy"> Update an existing site
                    </div>
                    <div class="existing-sites hide">
                        <b>Existing sites</b>
                        ${listOfSites()}
                    </div>
                </div>
                <div class="form-group">
                    <button class="btn btn-primary deploy-btn"><span class="fa fa-upload"></span> Deploy</button>
                </div>
            </form>
            `;

      // ============= modal to set the content of the details of hosting user website form =============
      modal.setContent(form);
      modal.open({
        attributes: {
          class: "form-modal",
        },
      });

      /* 
      =======================================
      Deploy radios button function to
      opthion to check if to host new
      site or to update another
      =======================================
      */
      const listenDeployCheck = () => {
        const radios = document.querySelectorAll(
          ".deploy-type-radios input[type='radio']"
        );
        radios.forEach((radio) => {
          radio.addEventListener("change", (e) => {
            if (!e.target.checked) {
              return;
            }

            const existingSiteDiv = document.querySelector(".existing-sites");
            if (e.target.value === "existing") {
              existingSiteDiv.classList.remove("hide");
            } else {
              existingSiteDiv.classList.add("hide");
            }
          });
        });
      };

      // ============= Delete site from netlify host =============
      const listenExistingSiteDelete = () => {
        const trashIcons = document.querySelectorAll(
          ".existing-sites li span.remove-domain"
        );
        trashIcons.forEach((trash) => {
          trash.addEventListener("click", (e) => {
            if (!confirm("Are you sure to delete this site?")) {
              noty.success("Cancel delete");
              return;
            }

            let site_id = e.target.parentNode.id;
            let domain = e.target.parentNode.querySelector("a").href;
            // =------------- get seo from server --------------=
            const getSEO = localStorage.getItem("gram-seo");
            const { token } = getSEO ? JSON.parse(getSEO) : {};

            const data = {
              site_id,
              type: "DELETE",
            };

            let delete_data = {
              type: "DELETE",
              url: getUrl(data),
              token,
              domain,
            };

            removeSiteFromNetlify(delete_data).then(() => {
              removeSite(site_id);
              e.target.parentNode.remove();
            });
          });
        });
      };

      // ============= Call This functions =============
      listenDeployCheck();
      listenExistingSiteDelete();
      toggleActiveOfDomainList();

      // ============= Show the form of deploy the user website =============
      const deployForm = document.querySelector("#deploy-form");
      deployForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(document.querySelector("#deploy-form"));
        const SEO = Object.fromEntries(formData);
        const { title, description, token } = SEO;
        if (!title) {
          noty.error("Title is required");
          return;
        }
        if (!description) {
          noty.error("Description is required");
          return;
        }
        if (!token) {
          noty.error("Netlify token is required");
          return;
        }
        // =------------- add the seo data in server --------------=
        localStorage.setItem("gram-seo", JSON.stringify(SEO));

        const existingSiteDiv = document.querySelector(".existing-sites");
        let type = existingSiteDiv.classList.contains("hide") ? "POST" : "PUT";
        let html = editor.getHtml() || "";
        let css = editor.getCss({ avoidProtected: true }) || "";
        let global = await getGlobalJsCss();
        const data = { token, title, description, html, css, global, type };
        if (type === "PUT") {
          // =------------- add site id in server --------------=
          let site_id = localStorage.getItem("gram-deploying-site");
          if (!site_id) {
            noty.error("You must check a site in existing sites.");
            return;
          }
          data.site_id = site_id;
        }
        prepareDeployContent(data);
      });
    },
    attributes: {
      title: "Deploy",
    },
  },
  {
    id: "download",
    className: "fa fa-download",
    command: (editor, sender) => {
      sender.set("active", 0);
      let modal = editor.Modal;
      modal.setTitle("Export");

      // ============= Get SEO function =============
      // =------------- get the seo from server --------------=
      const getSEO = localStorage.getItem("gram-seo");
      const { title, description } = getSEO
        ? JSON.parse(getSEO)
        : { title: "", description: "" };

      // ============= Form to set the name and the description of user website =============
      const form = `
            <form id="export-form" class="gram-form">
                <div class="form-group">
                    <label>Website Title <span class="required">*</span></label>
                    <input type="text" name="title" ${
                      title ? 'value="' + title + '"' : ""
                    } class="form-control">
                </div>
                <div class="form-group">
                    <label>Website Description <span class="required">*</span></label>
                    <textarea name="description" class="form-control">${
                      description || ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <button class="btn btn-primary export-btn"><span class="fa fa-download"></span> Export</button>
                </div>
            </form>
            `;

      // ============= modal to set the content of the name & description form =============
      modal.setContent(form);
      modal.open({
        attributes: {
          class: "form-modal",
        },
      });

      // ============= Show the form of set name & description of user website =============
      const exportForm = document.querySelector("#export-form");
      exportForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(document.querySelector("#export-form"));
        const SEO = Object.fromEntries(formData);
        const { title, description } = SEO;
        if (!title) {
          noty.error("Title is required");
          return;
        }
        if (!description) {
          noty.error("Description is required");
          return;
        }
        // =------------- set the seo in server --------------=
        localStorage.setItem("gram-seo", JSON.stringify(SEO));

        let html = editor.getHtml() || "";
        let css = editor.getCss({ avoidProtected: true }) || "";
        let global = await getGlobalJsCss();
        const data = { title, description, html, css, global };
        exportZip(data);
      });
    },
    attributes: {
      title: "Download as zip",
    },
  },
];

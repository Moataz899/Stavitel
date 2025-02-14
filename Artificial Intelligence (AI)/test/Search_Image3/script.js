const accessKey = "vrJzGZDBcUH-jTxX-v7qSph89W4O078RnSmdnII5eRk";
const searchform = document.getElementById("search_form");
const searchBox = document.getElementById("search_box");
const searchResult = document.getElementById("search_result");
const showMoreBtn = document.getElementById("show_more_btn");

let keyword = "";
let page = 1;

async function searchImages() {
    keyword = searchBox.value;
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;

    const response = await fetch(url);
    const data = await response.json();

    if (page == 1) {
        searchResult.innerHTML = "";
    }

    const results = data.results;

    results.map((result) => {
        const image = document.createElement("img");
        image.src = result.urls.small;
        const imageLink = document.createElement("a");
        imageLink.href = result.urls.full; // Direct link to full-size image for download
        imageLink.target = "_blank";

        // Add click event listener to imageLink element to copy image path to clipboard
        imageLink.addEventListener("click", (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(result.urls.full);
        });

        imageLink.appendChild(image);
        searchResult.appendChild(imageLink);
    });
    showMoreBtn.style.display = "block";
}

searchform.addEventListener("submit", (e) => {
    e.preventDefault();
    page = 1;
    searchImages();
});

showMoreBtn.addEventListener("click", () => {
    page++;
    searchImages();
});



console.log("Here is the popup")

async function documentEvents() {
    var query = document.getElementById("query");
    const spinnerDisplayer = document.querySelector(".spinner-displayer");
    query.addEventListener("keypress", async function (event) {
        if (event.key == "Enter") {
            event.preventDefault();

            console.log("Raw query: " + query.value);

            var url = new URL("https://api.scryfall.com/cards/search");
            url.searchParams.append("q", query.value);
            url.searchParams.append("unique", "prints");
            url.searchParams.append("order", "usd");
            url.searchParams.append("dir", "asc");
            console.log(url.href);

            spinnerDisplayer.classList.add("loading");

            const resp = await fetch(url.href).then(resp => resp.json());
            console.log(resp);

            spinnerDisplayer.classList.remove("loading");

            var resultDiv = document.getElementById("results");
            var resultHtml = ``;

            if (resp.status == 404) {
                resultHtml += `
                ${resp.details}
                `;
            } else {
                var validCards = resp.data.filter(function (c) {
                    return (
                        c.prices.usd !== null
                        && c.games.includes("paper")
                        && c.name.toLowerCase() == query.value.toLowerCase()
                    );
                });

                console.log(validCards);

                if (validCards.length === 0) {
                    resultHtml += `
                    <div class="summary">
                    Found no valid cards. Try another search.
                    </div>
                    `;
                } else {
                    var minPrice, maxPrice;
                    minPrice = maxPrice = validCards[0].prices.usd;
                    for (i = 1; i < validCards.length; i++) {
                        minPrice = Math.min(minPrice, validCards[i].prices.usd);
                        maxPrice = Math.max(maxPrice, validCards[i].prices.usd);
                    }

                    resultHtml += `
                    <div class="summary">
                        Found <b>${validCards.length}</b> result(s)
                        <br>Minimum price: <b>$${minPrice}</b>
                        <br>Maximum price: <b>$${maxPrice}</b>
                        <br><br>(Click on card images to go to TCG Player)
                    </div>
                    `;

                    for (var i = 0; i < Math.min(validCards.length, 5); i++) {
                        resultHtml += `
                        <div class="container">
                            <div class="image">
                                <a target="_blank" href="${validCards[i].purchase_uris.tcgplayer}">
                                    <img src="${validCards[i].image_uris.small}">
                                </a>
                            </div>
                            <div class="text">
                                Price: <b>$${validCards[i].prices.usd}</b>
                                <br>Set: <b>${validCards[i].set_name}</b> (<b>${validCards[i].set.toUpperCase()}</b>)
                                <br>Released: <b>${validCards[i].released_at}</b>
                            </div>
                        </div>
                        `;
                    }
                }
            }

            resultDiv.innerHTML = resultHtml;
        }
    });
}

document.addEventListener("DOMContentLoaded", documentEvents, false);

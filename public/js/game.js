let deck_id = "yo7ih6uj137s";
let board = {
    amount:0,
    cards:[],
}

async function getDeck() {
    let url = "/game/startup"
                
    try {
        let response = await fetch(url);
        let data = await response.json();
        deck_id = data.deck_id;
        console.log(data);
    }
    catch(err){
        console.log(err);
    }
}
//sendRequest();


export async function shuffleDeck(){
    let url = "/game/shuffle"
    let cfg = {
        method: "GET",
        headers: {
            "deck_id": deck_id,
            "amount": 2
        }
    }            ;
    try {
        let response = await fetch(url,cfg);
        let data = await response.json();
        spanDeck.innerHTML = data.remaining;
        board.amount = 0;
        board.cards = []
        console.log(data);
    }
    catch(err){
        console.log(err);
    }
}
export async function drawCard() {
    let url = "/game/draw"
    let cfg = {
        method: "GET",
        headers: {
            "deck_id": deck_id,
            "amount": 2
        }
    };
    try {
        let response = await fetch(url,cfg);
        let data = await response.json();
        console.log(data);
        if(data.cards.length > 0){
            spanDeck.innerHTML = data.remaining
            board.amount += data.cards.length;
            board.cards.push(data.cards);
            showCards(data.cards)
            console.log(board);
        }    
    }
    catch(err){
        console.log(err);
    }
}
         
function showCards(cardsArr) {
    console.log(cardsArr);
    let div = document.createElement("div");
    div.classList.add("row")
    for (const card of cardsArr) {
        
        let cardname = `${card.value} of ${card.suit}`
        let img = document.createElement("img");                
        img.src = card.image;
        img.alt = cardname
        img.classList.add("card")
            
        div.appendChild(img);
    }
    container.appendChild(div)
}
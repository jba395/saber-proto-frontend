document.addEventListener("keyup", event => {
    if (event.code === 'Space') {
        begin();
    } else if (event.code === "Escape") {
        reset();
    } else if (event.code === "ArrowLeft") {
        operation("lower");
    } else if (event.code === "ArrowRight") {
        operation("upper");
    } else if (event.code === "ArrowDown") {
        operation("back");
    } else {
        console.log("Invalid operation!");
    }
})

function begin() {

    // Get a random verse
    fetch("http://localhost:5000/version/eng_kjv/verse/random_id").then(response => response.json()
    ).then(response => {
        console.log(response["verse"]);
        document.getElementById("selected_verse").textContent = response["verse"];
        return response;
    }).then(verse => {
        console.log(verse);

        // Begin the game
        fetch(
            `http://localhost:5000/version/eng_kjv/game/begin?selected_verse=${verse}`, {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "index": verse["index"], 
                    "verse": verse["verse"]
                })
            })
        // Resolve result of game initiation
        .then(response => response.json())
        .then(response => {
            // Save game id
            localStorage.setItem("game_id", response["uuid"]);
            console.log(localStorage.getItem("game_id"));

            // Update the bounds on the screen
            init = response["events"][0]
            document.getElementById("lower_bound").textContent = init["lower_bound"]["verse"]
            document.getElementById("midpoint_lower").textContent = init["midpoint_lower"]["verse"]
            document.getElementById("midpoint_upper").textContent = init["midpoint_upper"]["verse"]
            document.getElementById("upper_bound").textContent = init["upper_bound"]["verse"]
        })
        .catch(err => {console.log(err)})
    }).catch(
        err => {console.log(err)}
    )
}

function reset() {
    console.log("Resetting game");
    document.getElementById("selected_verse").textContent = "Press SPACEBAR to begin";
    document.getElementById("lower_bound").textContent = "";
    document.getElementById("midpoint_lower").textContent = "";
    document.getElementById("midpoint_upper").textContent = "";
    document.getElementById("upper_bound").textContent = "";
}

function operation(event_type) {

    // All other scenarios
    let game_id = localStorage.getItem("game_id");
    fetch(
        `http://localhost:5000/version/eng_kjv/game/${game_id}/event`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "event_type": event_type
        })
    }).then(response => response.json())
    .then(response => {
        console.log(response)
        return response
    })

    // Update the DOM
    .then(response => {
        document.getElementById("lower_bound").textContent = response["lower_bound"]["verse"]
        document.getElementById("midpoint_lower").textContent = response["midpoint_lower"]["verse"]
        document.getElementById("midpoint_upper").textContent = response["midpoint_upper"]["verse"]
        document.getElementById("upper_bound").textContent = response["upper_bound"]["verse"]

        // Check for victory condition
        if (response["type"] === "complete") {
            let total_time = response["current_time"] - response["start_time"];
            total_time = total_time.toFixed(2);
            alert(`Congratulations! You completed in ${total_time} seconds.`);
        }
    })
    .catch(err => {console.log(err)})
}

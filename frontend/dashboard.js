async function addLink() {
    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;

    const response = await fetch("http://localhost:3000/add-link", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "ben",
            title: title,
            url: url
        })
    });

    const data = await response.json();
    alert("Link added!");
}

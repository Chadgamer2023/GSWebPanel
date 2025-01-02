document.getElementById("run-command").addEventListener("click", () => {
    const command = document.getElementById("command").value;
  
    fetch("/execute-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          window.location.reload();
        }
      });
  });
  
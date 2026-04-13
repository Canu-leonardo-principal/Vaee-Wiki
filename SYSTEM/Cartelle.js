// SYSTEM/folders.js

// Funzione ricorsiva che crea l'albero delle cartelle e dei file
function createFolderTree(tree, parentElement, path="", level=0) {
    
    Object.keys(tree).forEach(key => {// Itera su ogni chiave dell'oggetto tree (cartelle o chiave 'files')
        if (key === "files") {// Controlla se la chiave è 'files', quindi contiene un array di file
            const ul = document.createElement("ul");// Crea un elemento <ul> per la lista dei file
            tree[key].forEach(file => {// Itera su ogni file nell'array
                
                const li = document.createElement("li");// Crea un elemento <li> per ciascun file
                
                li.className = "file";// Imposta la classe CSS 'file' per l'elemento

                li.innerHTML = `<a href='WIKI/${path}${file}'>${file.replace(".html", "")}</a>`;// Inserisce un link all'interno del <li> al file corrispondente
                ul.appendChild(li);// Aggiunge il <li> all'<ul>
            });
            parentElement.appendChild(ul);// Aggiunge l'<ul> dei file al parentElement passato alla funzione
        } else {
            const folderDiv = document.createElement("div");// Crea un div per rappresentare la cartella
            folderDiv.className = "folderdiv";// Imposta la classe CSS 'folderdiv' per il div

            const folderHeader = document.createElement("h3");// Crea un elemento <h3> come intestazione della cartella
            folderHeader.textContent = key + "    ";// Imposta il testo dell'intestazione al nome della cartella
            console.log(key);
            folderHeader.style.cursor = "pointer";// Cambia il cursore per indicare che è cliccabile

            const freccietta = document.createElement("h5"); // Crea un'altro h3
            freccietta.textContent = "V";// è La Freccietta del toggle !!
            freccietta.classList.add("UnSelected"); // gli da la classe unselected
            freccietta.style.cursor = "pointer", // Ora è un puntatore

            folderHeader.addEventListener("click", () => {// Aggiunge un listener per clic sul nome della cartella
                const children = folderDiv.querySelectorAll(":scope > div, :scope > ul");// Seleziona i figli diretti <div> e <ul> della cartella
                children.forEach(c => {// Per ogni figlio, alterna la visibilità tra 'none' e 'block'
                    c.style.display = c.style.display === "none" ? "block" : "none";
                });
                freccietta.className = freccietta.className === "Selected" ? "UnSelected" : "Selected"; //Scambia la classe della freccietta
            });

            freccietta.addEventListener("click", () => {// Aggiunge un listener Anche alla freccetta
                const children = folderDiv.querySelectorAll(":scope > div, :scope > ul");// Seleziona i figli diretti <div> e <ul> della cartella
                children.forEach(c => {// Per ogni figlio, alterna la visibilità tra 'none' e 'block'
                    c.style.display = c.style.display === "none" ? "block" : "none";
                });
                freccietta.className = freccietta.className === "Selected" ? "UnSelected" : "Selected"; //Scambia la classe della freccietta
            });


            folderDiv.appendChild(folderHeader);// Aggiunge l'intestazione della cartella al div della cartella
            folderDiv.appendChild(freccietta);
            parentElement.appendChild(folderDiv);// Aggiunge il div della cartella al parentElement

            createFolderTree(tree[key], folderDiv, path + key + "/", level + 1);// Chiama ricorsivamente la funzione per le sottocartelle
        }
    });
}

fetch("SYSTEM/folders.json")// Effettua il fetch del JSON generato dal Python
    
    .then(r => r.json())// Converte la risposta in JSON    
    .then(tree => {// Riceve l'oggetto tree e crea l'albero delle cartelle nel container
        const container = document.getElementById("content");// Seleziona il div principale con id 'content'
        if (!container) return;// Se non esiste, termina l'esecuzione
        createFolderTree(tree, container);// Chiama la funzione per generare l'albero delle cartelle
    });
import os 
import json

WIKI_DIR = "WIKI"

def build_tree(path):
    """
    Costruisce un dizionario ricorsivo con tutte le cartelle e file .html,
    ignorando le cartelle chiamate 'MD'.
    """
    tree = {}
    files = []

    for entry in sorted(os.listdir(path)):
        full_path = os.path.join(path, entry)
        
        # Ignora la cartella 'MD'
        if os.path.isdir(full_path) and entry == "MD":
            continue

        if os.path.isdir(full_path):
            tree[entry] = build_tree(full_path)  # ricorsione
        else:
            if entry.endswith(".html"):  # include solo file .html
                files.append(entry)

    if files:
        tree["files"] = files

    return tree

# Costruisci l’albero a partire da WIKI/
wiki_tree = build_tree(WIKI_DIR)

# Salva in JSON
with open("SYSTEM/folders.json", "w", encoding="utf8") as f:
    json.dump(wiki_tree, f, indent=4, ensure_ascii=False)

print("Generato SYSTEM/folders.json con gerarchia completa, ignorando la cartella 'MD' e includendo solo file .html")

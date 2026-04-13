import os
import json

WIKI_DIR = "WIKI"

def build_tree(path):
    tree = {}
    files = []
    subdirs = {}

    for entry in sorted(os.listdir(path)):
        full_path = os.path.join(path, entry)

        # Ignora la cartella 'MD'
        if os.path.isdir(full_path) and entry == "MD":
            continue

        if os.path.isdir(full_path):
            subdirs[entry] = build_tree(full_path)
        else:
            if entry.endswith(".html"):
                files.append(entry)

    # Prima i file
    if files:
        tree["files"] = files

    # Poi le cartelle
    for name, content in subdirs.items():
        tree[name] = content

    return tree

# Costruisci l’albero
wiki_tree = build_tree(WIKI_DIR)

# Salva in JSON
with open("SYSTEM/folders.json", "w", encoding="utf8") as f:
    json.dump(wiki_tree, f, indent=4, ensure_ascii=False)

# Stampa la struttura
print(json.dumps(wiki_tree, indent=4, ensure_ascii=False))
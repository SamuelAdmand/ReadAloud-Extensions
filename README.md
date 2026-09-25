# ReadAloud Extensions Repository

Official community repository for **[ReadAloud](https://github.com/SamuelAdmand/ReadAloud)** website extractor extensions and paywall bypass plugins.

---

## 🚀 How It Works
ReadAloud uses a dynamic, SpotiFLAC-style extension architecture. Website scraping logic and custom paywall bypasses run in sandboxed JavaScript extensions that can be updated or installed on the fly without updating the Android app!

## 📦 Default Repository URL
To use this repository in ReadAloud:
1. Open **ReadAloud**
2. Go to **Settings > Article Extraction > Extensions**
3. Open the **Store** tab to browse and install available extensions with one tap!

Default Repository Index:
```text
https://raw.githubusercontent.com/SamuelAdmand/ReadAloud-Extensions/main/registry.json
```

---

## 🛠 Available Extensions

| Extension | Version | Description | Target Domains |
| :--- | :--- | :--- | :--- |
| **Medium & Partner Blogs** | `v1.0.0` | Bypasses member overlays and extracts clean story text | `medium.com`, `*.medium.com`, `towardsdatascience.com`, `hackernoon.com` |
| **Wikipedia Cleaner** | `v1.0.0` | Removes bracketed citations `[1]`, edit buttons, and infoboxes for pure listening | `wikipedia.org`, `*.wikipedia.org` |

---

## 🧑‍💻 Developing a New Extension

Each extension resides in `sources/<extension-id>/` with two required files:

1. **`manifest.json`**:
```json
{
  "id": "com.samuel.extractor.example",
  "name": "Example Extractor",
  "version": "1.0.0",
  "author": "YourName",
  "description": "Extracts clean article text from example.com",
  "domains": ["example.com", "*.example.com"],
  "priority": 100,
  "main": "index.js"
}
```

2. **`index.js`**:
An immediately-invoked JavaScript function returning a JSON string `{ "title": "...", "text": "..." }`:
```javascript
(function() {
    var title = document.querySelector('h1')?.innerText || document.title;
    var article = document.querySelector('article') || document.body;
    return JSON.stringify({
        title: title.trim(),
        text: article.innerText.trim()
    });
})();
```

### Packaging an Extension
Zip the contents of your source folder and name the file `<extension-id>.readaloud-ext`, then add an entry into `registry.json`.

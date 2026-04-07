export const metadata = { title: "CURATED", description: "Premium Music Licensing" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
```
- Click **Commit new file**

---

**Step 4 — Check your repo root looks like this:**
```
CuratedApp.jsx
package.json
next.config.js
app/
  page.js
  layout.js

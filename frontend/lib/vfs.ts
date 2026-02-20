export type FileNode = {
  type: "file"
  name: string
  content: string
}

export type DirNode = {
  type: "dir"
  name: string
  children: Record<string, FSNode>
}

export type FSNode = FileNode | DirNode

export function isDir(n: FSNode | undefined | null): n is DirNode {
  return !!n && (n as any).type === "dir"
}
export function isFile(n: FSNode | undefined | null): n is FileNode {
  return !!n && (n as any).type === "file"
}

export function createDir(name: string): DirNode {
  return { type: "dir", name, children: {} }
}
export function createFile(name: string, content = ""): FileNode {
  return { type: "file", name, content }
}

export function createInitialFS(): DirNode {
  const root = createDir("")
  const project = createDir("project")
  project.children["index.html"] = createFile("index.html", defaultIndexHtml)
  project.children["style.css"] = createFile("style.css", defaultCss)
  project.children["main.js"] = createFile("main.js", defaultJs)
  root.children["project"] = project
  return root
}

export function vfsClone<T extends FSNode>(node: T): T {
  return JSON.parse(JSON.stringify(node))
}

export function joinPath(base: string[], name: string): string[] {
  return [...base, name]
}

export function vfsFindByPath(root: DirNode, path: string[]): FSNode | undefined {
  let cur: FSNode = root
  for (const seg of path) {
    if (!isDir(cur)) return undefined
    cur = cur.children[seg]
    if (!cur) return undefined
  }
  return cur
}

export function vfsMkdir(dir: DirNode, name: string) {
  if (dir.children[name]) return
  dir.children[name] = createDir(name)
}

export function vfsTouch(dir: DirNode, name: string) {
  if (!dir.children[name]) dir.children[name] = createFile(name, "")
}

export function vfsSetFile(dir: DirNode, name: string, content: string) {
  dir.children[name] = createFile(name, content)
}

export function vfsRemove(dir: DirNode, name: string) {
  delete dir.children[name]
}

export function vfsList(dir: DirNode): string[] {
  const names = Object.keys(dir.children)
  names.sort((a, b) => a.localeCompare(b))
  return names
}

const defaultIndexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Preview</title>
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <h1>Hello Preview</h1>
    <p id="msg">Edit files and see the result here.</p>
    <button onclick="document.getElementById('msg').textContent = 'Clicked!'">Click me</button>
    <script src="./main.js"></script>
  </body>
</html>`

const defaultCss = `body { font-family: system-ui, sans-serif; padding: 16px; }
h1 { color: #10b981; }`

const defaultJs = `console.log('Preview JS loaded');`

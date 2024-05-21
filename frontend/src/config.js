const backend_url = process.env.CODESPACE_NAME ? `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` : "http://localhost:3000"

export default backend_url


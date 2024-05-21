

  if (process.env.CODESPACE_NAME) {
    const BACKEND_URL = `http://${process.env.CODESPACE_NAME}-3000.app.github.dev`;

  } else {

    const BACKEND_URL = "http://localhost:3000";
  }
export default BACKEND_URL
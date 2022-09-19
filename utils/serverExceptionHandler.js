const serverException = (server, options = { coredump: false, timeout: 500 }) => {
    // Exit function
    const exit = code => {
      options.coredump ? process.abort() : process.exit(code)
    }
  
    return (code, reason) => (err, promise) => {
      if (err && err instanceof Error) {
      console.log(reason, err.name, err.message)
      process.exit(code);
      }

      // Attempt a graceful shutdown
      server.close(() => {
              console.log(reason)
      })
      setTimeout(exit, options.timeout).unref()
    }
  }

  module.exports = serverException
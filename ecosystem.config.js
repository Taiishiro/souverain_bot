module.exports = {
  apps: [{
    name: "souverain_bot",
    script: "./dist/main.js",
    instances: 1,
    exec_mode: "fork",
    // Alloue 4 Go de RAM à NodeJS (ajuste selon ton serveur, 4096 = 4Go, 8192 = 8Go)
    node_args: "--max-old-space-size=4096",
    env: {
      NODE_ENV: "production",
    }
  }]
}
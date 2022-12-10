module.exports = {
  apps : [{
    name   : "app",
    script : "./build/index.js",
    watch: true,
    ignore_watch: ["public","src", "node_modules"],
    autorestart: true,
    max_memory_restart: '2G',
  }]
}

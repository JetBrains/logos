module.exports = {
  "plugins": [
    {
      name: 'preset-default',
      params: {
        overrides: {
          "removeUselessStrokeAndFill": {
            "fill": false
          }
        }
      }
    },
    {
      name: "convertStyleToAttrs",
    },
    { name: "prefixIds" },
    { name: "cleanupListOfValues" },
  ]
}
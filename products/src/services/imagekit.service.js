const ImageKit = require('imagekit')

var imagekit = new ImageKit({
    publicKey : process.env.PUBLIC_KEY,
    privateKey : process.env.PRIVATE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT
});
// Upload function internally uses the ImageKit.io javascript SDK
function uploadImage(data) {
    var file = document.getElementById("file1");
    imagekit.upload({
        file : file.files[0],
        fileName : "abc1.jpg",
        tags : ["tag1"]
    }, function(err, result) {
        console.log(arguments);
        console.log(imagekit.url({
            src: result.url,
            transformation : [{ height: 300, width: 400}]
        }));
    })
}
var index = 0;
var timeout;
function leak() {
    index++;
    timeout = setTimeout(leak, 0);
}

leak();

setInterval(function() {
    console.log('cleared timeout: ', index);
    clearTimeout(timeout);
}, 10000);

setInterval(function() {
        console.log(process.memoryUsage());
}, 2000);
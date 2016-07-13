/**
 * Created by arjunMitraReddy on 7/11/2016.
 */
export default function scriptLoader(urls, controller, failure) {
    var count = urls.length;
    var errored = false;

    if (urls.length == 0) return controller();

    urls.forEach((url) => {
        var script = document.createElement('script');
        script.onload = function() {
            if (errored) return;
            if (!--count) controller();
        };

        script.onerror = function() {
            if (errored) return;
            failure();
            errored = true;
        };
        script.src = url;
        document.head.insertBefore(script, document.head.firstChild);
    });
}
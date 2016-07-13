/**
 * Created by arjunMitraReddy on 7/11/2016.
 */
var contextRange = document.createRange();
contextRange.setStart(document.body, 0);

export default function stringToElements(str) {
    return contextRange.createContextualFragment(str);
}
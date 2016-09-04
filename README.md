# Caltrain 
Offline First, Mobile First Public Transportation Application. Second Project in the Udacity Senior Web Developer Nanodegree Program.
The application utilizes Service Worker to enable offline functionality and IndexedDB to store the train data fetched from Caltrain API.

##[DEMO](https://offline-first-amr.herokuapp.com)  

### Mobile  
<img src="https://github.com/arjunmitrareddy/Udacity_Senior_Web_Dev_Project2/blob/master/public/imgs/mobile.png" width="300" height="500" />

###Desktop
![image](https://github.com/arjunmitrareddy/Udacity_Senior_Web_Dev_Project2/blob/master/public/imgs/desktop.png)
Application fully functional in offline mode.

##Technologies Used:
[ECMAScript 6](http://es6-features.org/)

[IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API)  

[Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

[Handlebars.js](http://handlebarsjs.com/)

[Node.js](https://nodejs.org/en/)

JQuery  

[Gulp](http://gulpjs.com/)

[Sass](http://sass-lang.com/)

HTML5, CSS3, BootStrap 3  

##Compiler Used:
[Babel](https://babeljs.io/)

##Instructions to Run the Application (PRODUCTION):
- Installing dependencies:
```{r, engine='bash', count_lines}
$ npm install
```

- Running the Application:
```{r, engine='bash', count_lines}
$ npm run serve
```
npm run serve, will run gulp serve, which will Compile, Collect & Minify all the Required Assets and Place them in a build directory and then serve it.


